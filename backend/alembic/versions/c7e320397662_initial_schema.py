"""initial schema

Revision ID: c7e320397662
Revises:
Create Date: 2026-07-26 15:24:45.573298

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "c7e320397662"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "hosted_zones",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column(
            "zone_type",
            sa.String(length=20),
            nullable=False,
            server_default="Public",
        ),
        sa.Column("vpc_id", sa.String(length=64), nullable=True),
        sa.Column("vpc_region", sa.String(length=64), nullable=True),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(
        op.f("ix_hosted_zones_name"), "hosted_zones", ["name"], unique=True
    )
    op.create_index(
        op.f("ix_hosted_zones_owner_id"), "hosted_zones", ["owner_id"], unique=False
    )

    op.create_table(
        "dns_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("hosted_zone_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(length=10), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("value", sa.String(length=1000), nullable=False),
        sa.Column("ttl", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["hosted_zone_id"],
            ["hosted_zones.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("dns_records")
    op.drop_index(op.f("ix_hosted_zones_owner_id"), table_name="hosted_zones")
    op.drop_index(op.f("ix_hosted_zones_name"), table_name="hosted_zones")
    op.drop_table("hosted_zones")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
