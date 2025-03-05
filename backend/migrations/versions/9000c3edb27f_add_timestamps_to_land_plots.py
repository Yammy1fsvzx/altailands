"""add timestamps to land_plots

Revision ID: 9000c3edb27f
Revises: 
Create Date: 2025-02-25 23:19:39.355825

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision: str = '9000c3edb27f'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('land_plots', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('land_plots', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.alter_column('land_plots', 'id',
               existing_type=sa.INTEGER(),
               nullable=False,
               autoincrement=True)
    op.alter_column('land_plots', 'description',
               existing_type=sqlite.JSON(),
               type_=sa.String(),
               nullable=True,
               existing_server_default=sa.text('\'{"text": "", "attachments": []}\''))
    op.alter_column('land_plots', 'price',
               existing_type=sa.INTEGER(),
               type_=sa.Float(),
               existing_nullable=True)
    op.alter_column('land_plots', 'price_per_sotka',
               existing_type=sa.INTEGER(),
               type_=sa.Float(),
               existing_nullable=True)
    op.alter_column('land_plots', 'cadastral_numbers',
               existing_type=sqlite.JSON(),
               type_=sa.String(),
               nullable=True,
               existing_server_default=sa.text("'[]'"))
    op.alter_column('land_plots', 'features',
               existing_type=sqlite.JSON(),
               type_=sa.String(),
               nullable=True,
               existing_server_default=sa.text("'[]'"))
    op.alter_column('land_plots', 'communications',
               existing_type=sqlite.JSON(),
               type_=sa.String(),
               nullable=True,
               existing_server_default=sa.text("'[]'"))
    op.drop_index('idx_land_plots_is_visible', table_name='land_plots')
    op.drop_index('idx_land_plots_title', table_name='land_plots')
    op.create_index(op.f('ix_land_plots_id'), 'land_plots', ['id'], unique=False)
    op.create_index(op.f('ix_land_plots_title'), 'land_plots', ['title'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_land_plots_title'), table_name='land_plots')
    op.drop_index(op.f('ix_land_plots_id'), table_name='land_plots')
    op.create_index('idx_land_plots_title', 'land_plots', ['title'], unique=False)
    op.create_index('idx_land_plots_is_visible', 'land_plots', ['is_visible'], unique=False)
    op.alter_column('land_plots', 'communications',
               existing_type=sa.String(),
               type_=sqlite.JSON(),
               nullable=False,
               existing_server_default=sa.text("'[]'"))
    op.alter_column('land_plots', 'features',
               existing_type=sa.String(),
               type_=sqlite.JSON(),
               nullable=False,
               existing_server_default=sa.text("'[]'"))
    op.alter_column('land_plots', 'cadastral_numbers',
               existing_type=sa.String(),
               type_=sqlite.JSON(),
               nullable=False,
               existing_server_default=sa.text("'[]'"))
    op.alter_column('land_plots', 'price_per_sotka',
               existing_type=sa.Float(),
               type_=sa.INTEGER(),
               existing_nullable=True)
    op.alter_column('land_plots', 'price',
               existing_type=sa.Float(),
               type_=sa.INTEGER(),
               existing_nullable=True)
    op.alter_column('land_plots', 'description',
               existing_type=sa.String(),
               type_=sqlite.JSON(),
               nullable=False,
               existing_server_default=sa.text('\'{"text": "", "attachments": []}\''))
    op.alter_column('land_plots', 'id',
               existing_type=sa.INTEGER(),
               nullable=True,
               autoincrement=True)
    op.drop_column('land_plots', 'updated_at')
    op.drop_column('land_plots', 'created_at')
    # ### end Alembic commands ###
