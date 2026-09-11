from datetime import date

from sqlalchemy import Date, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class IndicatorObservation(Base):
    __tablename__ = "indicator_observations"

    __table_args__ = (
        UniqueConstraint(
            "country_id",
            "indicator_id",
            "source_id",
            "observation_date",
            name="uq_indicator_observation",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    country_id: Mapped[int] = mapped_column(
        ForeignKey("countries.id"),
        nullable=False,
    )

    document_id: Mapped[int | None] = mapped_column(
        ForeignKey("source_documents.id"),
        nullable=True,
    )

    indicator_id: Mapped[int] = mapped_column(
        ForeignKey("economic_indicators.id"),
        nullable=False,
    )

    source_id: Mapped[int] = mapped_column(
        ForeignKey("data_sources.id"),
        nullable=False,
    )

    observation_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    country = relationship(
        "Country",
        back_populates="observations",
    )

    indicator = relationship(
        "EconomicIndicator",
        back_populates="observations",
    )

    source = relationship(
        "DataSource",
        back_populates="observations",
    )