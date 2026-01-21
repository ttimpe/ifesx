import { Model, Table, Column, DataType, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import { RecUmlauf } from './RecUmlauf';
import { RecLid } from './RecLid';

@Table({
    tableName: 'REC_FRT',
    timestamps: false
})
export class RecFrt extends Model {
    @PrimaryKey
    @Column(DataType.INTEGER)
    BASIS_VERSION!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    FRT_FID!: number;

    @Column(DataType.INTEGER)
    FRT_START?: number;

    @ForeignKey(() => RecLid)
    @Column(DataType.INTEGER)
    LI_NR?: number; // FK to Line

    @ForeignKey(() => RecUmlauf)
    @Column(DataType.INTEGER)
    UM_UID?: number; // FK to Block

    @Column(DataType.INTEGER)
    TAGESART_NR?: number;

    @Column(DataType.INTEGER)
    FGR_NR?: number;

    @Column(DataType.STRING(6))
    STR_LI_VAR?: string;

    @Column(DataType.INTEGER)
    ZUGNR?: number;

    @Column(DataType.INTEGER)
    LI_KU_NR?: number; // Linienkursnummer

    @Column(DataType.INTEGER)
    BEREICH_NR?: number; // Fahrzeitgruppe / Bereich

    @Column(DataType.INTEGER)
    FAHRTART_NR?: number; // Trip Type (MENGE_FAHRTART)

    // Add more fields as needed per XSD
}
