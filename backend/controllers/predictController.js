const numeric = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

export const predictCyclone = (req, res) => {
  const d = req.body || {};
  const sst = numeric(d.Sea_Surface_Temperature || d.Sea_Surface_Temperature);
  const windShear = numeric(d.Wind_Shear);
  const vorticity = numeric(d.Vorticity);
  const proximity = numeric(d.Proximity_to_Coastline);

  let score = 0;
  if (!Number.isNaN(sst)) score += Math.max(0, sst - 25);
  if (!Number.isNaN(windShear)) score += Math.max(0, 10 - windShear);
  if (!Number.isNaN(vorticity)) score += vorticity / 5;
  if (!Number.isNaN(proximity)) score += proximity > 0 ? 1 : 0;

  const confidence = Math.min(0.99, Math.tanh(score / 10) * 0.9 + 0.05);
  const risk = confidence > 0.5 ? "High" : confidence > 0.2 ? "Medium" : "Low";

  return res.json({
    ok: true,
    hazard: "cyclone",
    risk,
    confidence: Number(confidence.toFixed(2)),
    details: { score },
  });
};

export const predictEarthquake = (req, res) => {
  const d = req.body || {};
  const lat = numeric(d.Latitude);
  const lon = numeric(d.Longitude);
  const depth = numeric(d.Depth);

  let score = 0;
  if (!Number.isNaN(depth)) score += Math.max(0, 100 - depth) / 100;
  score += Math.random() * 0.2;

  const confidence = Math.min(0.98, score);
  const risk = confidence > 0.6 ? "High" : confidence > 0.3 ? "Medium" : "Low";

  return res.json({
    ok: true,
    hazard: "earthquake",
    risk,
    confidence: Number(confidence.toFixed(2)),
    location: { latitude: lat, longitude: lon, depth },
  });
};

export const predictFlood = (req, res) => {
  const d = req.body || {};
  const rainfall = numeric(d["Rainfall (mm)"] || d.rainfall || d.Rainfall);
  const waterLevel = numeric(
    d["Water Level (m)"] || d["Water Level"] || d.water_level
  );
  const popDensity = numeric(d["Population Density"] || d.populationDensity);
  const elevation = numeric(d["Elevation (m)"] || d.Elevation);

  let score = 0;
  if (!Number.isNaN(rainfall)) score += rainfall / 50;
  if (!Number.isNaN(waterLevel)) score += waterLevel / 5;
  if (!Number.isNaN(elevation)) score += Math.max(0, 5 - elevation) / 5;
  if (!Number.isNaN(popDensity)) score += Math.min(popDensity / 1000, 1);

  const confidence = Math.min(0.99, score / 2);
  const risk = confidence > 0.6 ? "High" : confidence > 0.3 ? "Medium" : "Low";

  return res.json({
    ok: true,
    hazard: "flood",
    risk,
    confidence: Number(confidence.toFixed(2)),
    details: { rainfall, waterLevel, elevation, populationDensity: popDensity },
  });
};

export const predictForestFire = (req, res) => {
  const d = req.body || {};
  const temp = numeric(d.temp);
  const rh = numeric(d.RH);
  const wind = numeric(d.wind);
  const rain = numeric(d.rain);

  let score = 0;
  if (!Number.isNaN(temp)) score += Math.max(0, (temp - 20) / 20);
  if (!Number.isNaN(rh)) score += Math.max(0, (50 - rh) / 50);
  if (!Number.isNaN(wind)) score += wind / 10;
  if (!Number.isNaN(rain)) score -= Math.min(rain / 10, 1);

  const confidence = Math.min(0.99, Math.max(0, score / 2));
  const risk = confidence > 0.6 ? "High" : confidence > 0.3 ? "Medium" : "Low";

  return res.json({
    ok: true,
    hazard: "forestfire",
    risk,
    confidence: Number(confidence.toFixed(2)),
    details: { temp, rh, wind, rain },
  });
};
