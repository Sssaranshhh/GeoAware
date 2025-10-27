import pandas as pd
from sklearn.preprocessing import StandardScaler

class DataPreprocessor:
    def __init__(self, scaler=None):
        self.required_columns = ['latitude', 'longitude', 'magnitude', 'depth']
        self.optional_columns = ['rainfall', 'temperature']
        self.feature_columns = self.required_columns + self.optional_columns
        self.target_column = 'hazard_level'
        self.scaler = scaler or StandardScaler()

    def prepare_data(self, df: pd.DataFrame, for_training=False, fit_scaler=False):
        """Prepare data for training or prediction.
        Args:
            df: DataFrame with input features
            for_training: If True, expect and validate target column
            fit_scaler: If True, fit the scaler on X (for training). If False, use existing scaler.
        Returns:
            X: Scaled feature matrix
            y: Target values (None if not for_training)
        """
        if for_training and self.target_column not in df.columns:
            raise ValueError(f"Missing target column: {self.target_column}")
        missing_cols = set(self.required_columns) - set(df.columns)
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")
        for col in self.optional_columns:
            if col not in df.columns:
                df[col] = 0.0
        if for_training:
            df = df.dropna(subset=self.feature_columns + [self.target_column])
            y = df[self.target_column]
        else:
            y = None
        X = df[self.feature_columns]
        if fit_scaler:
            X_scaled = pd.DataFrame(self.scaler.fit_transform(X), columns=self.feature_columns, index=X.index)
        else:
            X_scaled = pd.DataFrame(self.scaler.transform(X), columns=self.feature_columns, index=X.index)
        return X_scaled, y

    def save_scaler(self, path):
        import joblib
        joblib.dump(self.scaler, path)

    def load_scaler(self, path):
        import joblib
        self.scaler = joblib.load(path)