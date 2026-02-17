import { Model, Table, Column, DataType, ForeignKey, PrimaryKey, BelongsTo } from 'sequelize-typescript';
import { RecSel } from './RecSel';
import { RecOrt } from './RecOrt';
import { BasisVersion } from './BasisVersion';

@Table({
    tableName: 'REC_SEL_ZP',
    timestamps: false
})
export class RecSelZp extends Model {
    @PrimaryKey
    @Column(DataType.INTEGER)
    BASIS_VERSION!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    BEREICH_NR!: number; // Betriebszweig (Line Branch)

    @PrimaryKey
    @Column(DataType.INTEGER)
    ONR_TYP_NR!: number; // Start Ort Type

    @PrimaryKey
    @ForeignKey(() => RecOrt)
    @Column(DataType.INTEGER)
    ORT_NR!: number; // Start Ort ID

    @PrimaryKey
    @ForeignKey(() => RecOrt)
    @Column(DataType.INTEGER)
    SEL_ZIEL!: number; // End Ort ID

    @PrimaryKey
    @Column(DataType.INTEGER)
    SEL_ZIEL_TYP!: number; // End Ort Type

    @PrimaryKey
    @ForeignKey(() => RecOrt)
    @Column(DataType.INTEGER)
    ZP_ONR!: number; // Intermediate Point ID (LSA, Waypoint)

    @PrimaryKey
    @Column(DataType.INTEGER)
    ZP_TYP!: number; // Intermediate Point Type (e.g. LSA)

    @Column(DataType.INTEGER)
    SEL_ZP_LAENGE?: number; // Distance from Start

    @PrimaryKey
    @Column(DataType.INTEGER)
    ZP_LFD_NR?: number; // Sequence Number

    // Logical parent: RecSel (Section) - Decoupled per user request
    // Composite key: BASIS_VERSION, BEREICH_NR, ONR_TYP_NR, ORT_NR, SEL_ZIEL, SEL_ZIEL_TYP
    // No Sequelize Association defined.

    @BelongsTo(() => RecOrt, { foreignKey: 'ORT_NR', targetKey: 'ORT_NR', as: 'startOrt' })
    startOrt?: RecOrt;

    @BelongsTo(() => RecOrt, { foreignKey: 'SEL_ZIEL', targetKey: 'ORT_NR', as: 'destOrt' })
    destOrt?: RecOrt;

    @BelongsTo(() => RecOrt, { foreignKey: 'ZP_ONR', targetKey: 'ORT_NR', as: 'zpOrt' })
    zpOrt?: RecOrt;
}
