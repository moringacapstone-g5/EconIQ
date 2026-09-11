from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class EconomicIndicator(Base):
    __tablename__ = "economic_indicators"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    unit: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    frequency: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    observations = relationship(
        "IndicatorObservation",
        back_populates="indicator",
    )