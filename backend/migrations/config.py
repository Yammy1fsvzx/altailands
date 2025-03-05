import os

SQLALCHEMY_DATABASE_URL = "sqlite:///" + os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "land_plots.db"
) 