import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
from typing import Dict

def create_hazard_heatmap(df: pd.DataFrame) -> Dict:
    fig = px.density_mapbox(
        df,
        lat='latitude',
        lon='longitude',
        z='severity',
        radius=10,
        mapbox_style="stamen-terrain"
    )
    
    return fig.to_json()

def create_trend_line(df: pd.DataFrame, metric: str) -> Dict:
    fig = go.Figure()
    fig.add_trace(
        go.Scatter(x=df['date'], y=df[metric], mode='lines+markers')
    )
    
    return fig.to_json()
