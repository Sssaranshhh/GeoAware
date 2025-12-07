"""
LLM-based travel advisory generation.
"""
import logging
from typing import Dict, Any

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import Config

logger = logging.getLogger(__name__)


class AdvisoryGenerator:
    """Generate travel advisories using LLM."""

    def __init__(self, use_groq: bool = None):
        """
        Initialize advisory generator.

        Args:
            use_groq: Use Groq instead of OpenAI (default: use config)
        """
        self.use_groq = use_groq if use_groq is not None else Config.USE_GROQ
        self._init_client()

    def _init_client(self):
        """Initialize LLM client."""
        if self.use_groq and Config.GROQ_API_KEY:
            try:
                from groq import Groq

                self.client = Groq(api_key=Config.GROQ_API_KEY)
                logger.info("✓ Initialized Groq client")
            except Exception as e:
                logger.warning(f"⚠ Failed to init Groq: {e}, falling back to mock")
                self.client = None
        elif Config.OPENAI_API_KEY:
            try:
                import openai

                openai.api_key = Config.OPENAI_API_KEY
                self.client = openai
                logger.info("✓ Initialized OpenAI client")
            except Exception as e:
                logger.warning(f"⚠ Failed to init OpenAI: {e}, using mock")
                self.client = None
        else:
            logger.warning("⚠ No API keys found, using mock LLM")
            self.client = None

    def generate_advisory(
        self,
        route_info: Dict[str, Any],
        hazard_info: Dict[str, Any],
    ) -> str:
        """
        Generate safety advisory for route.

        Args:
            route_info: Route metrics (distance, eta, hazard_exposure, etc.)
            hazard_info: Hazard context (forecast, baseline, time_horizon)

        Returns:
            Safety advisory (2-3 sentences)
        """
        if self.client:
            try:
                return self._generate_with_llm(route_info, hazard_info)
            except Exception as e:
                logger.warning(f"⚠ LLM generation failed: {e}, using fallback")

        return self._generate_fallback_advisory(route_info, hazard_info)

    def _generate_with_llm(
        self,
        route_info: Dict[str, Any],
        hazard_info: Dict[str, Any],
    ) -> str:
        """Generate advisory using LLM API."""
        distance = route_info.get("distance_km", 0)
        hazard_exp = route_info.get("hazard_exposure", 0)
        max_hazard = route_info.get("max_hazard", 0)
        time_horizon = hazard_info.get("time_horizon", "now")
        discharge_ratio = hazard_info.get("discharge_ratio", 1.0)

        prompt = f"""Generate a brief 2-3 sentence safety advisory for a traveler given:
- Route distance: {distance:.1f} km
- Hazard exposure score: {hazard_exp:.2f} (0=safe, 1=critical)
- Max hazard on route: {max_hazard:.2f}
- Time horizon: {time_horizon}
- Discharge ratio: {discharge_ratio:.2f}x baseline

Be concise and practical. Include safety recommendation."""

        if self.use_groq and hasattr(self.client, "messages"):
            # Groq API
            try:
                response = self.client.messages.create(
                    model="mixtral-8x7b-32768",
                    max_tokens=100,
                    messages=[{"role": "user", "content": prompt}],
                )
                advisory = response.content[0].text.strip()
                logger.debug(f"LLM advisory generated: {advisory}")
                return advisory
            except Exception as e:
                logger.error(f"Groq error: {e}")
                raise

        else:
            # OpenAI API
            try:
                response = self.client.ChatCompletion.create(
                    model=Config.LLM_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=100,
                    temperature=0.7,
                )
                advisory = response.choices[0].message.content.strip()
                logger.debug(f"LLM advisory generated: {advisory}")
                return advisory
            except Exception as e:
                logger.error(f"OpenAI error: {e}")
                raise

    def _generate_fallback_advisory(
        self,
        route_info: Dict[str, Any],
        hazard_info: Dict[str, Any],
    ) -> str:
        """Generate rule-based advisory (fallback)."""
        hazard_exp = route_info.get("hazard_exposure", 0)
        max_hazard = route_info.get("max_hazard", 0)
        time_horizon = hazard_info.get("time_horizon", "now")
        discharge_ratio = hazard_info.get("discharge_ratio", 1.0)

        # Rule-based logic
        if hazard_exp < 0.2:
            hazard_msg = "conditions are favorable"
        elif hazard_exp < 0.5:
            hazard_msg = "conditions are generally safe but remain cautious"
        elif hazard_exp < 0.75:
            hazard_msg = "conditions show elevated flood risk"
        else:
            hazard_msg = "conditions present significant flood risk"

        discharge_msg = ""
        if discharge_ratio > 2.0:
            discharge_msg = " Current water discharge is substantially above normal. "
        elif discharge_ratio > 1.5:
            discharge_msg = " River levels are elevated. "

        time_msg = ""
        if time_horizon == "48h":
            time_msg = " Monitor updates, as conditions may worsen in 48 hours."
        elif time_horizon == "24h":
            time_msg = " Check forecasts within 24 hours."

        advisory = f"Route analysis shows {hazard_msg}.{discharge_msg}Plan accordingly and avoid high-hazard zones.{time_msg}"
        return advisory.strip()
