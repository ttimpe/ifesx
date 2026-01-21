import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { RecLid } from './RecLid';
import { RecHp } from './RecHp';
import { RecOrt } from './RecOrt';
import { BasisVersion } from './BasisVersion';

@Table({
    tableName: 'LID_VERLAUF',
    timestamps: false
})
export class LidVerlauf extends Model {
    // P1
    @PrimaryKey
    @ForeignKey(() => BasisVersion)
    @Column({
        type: DataType.INTEGER,
        defaultValue: 1
    })
    BASIS_VERSION!: number;

    // P4
    @PrimaryKey
    @Column(DataType.INTEGER)
    LI_LFD_NR!: number; // Was LAUFENDE_NR

    // P2
    @PrimaryKey
    @ForeignKey(() => RecLid)
    @Column(DataType.INTEGER)
    LI_NR!: number; // Was LID_NR

    // P3
    @PrimaryKey
    @Column(DataType.STRING(6))
    STR_LI_VAR!: string; // Was LID_VERLAUF_NR (sort of)

    @ForeignKey(() => RecHp)
    @Column(DataType.INTEGER)
    ONR_TYP_NR!: number;

    @ForeignKey(() => RecHp)
    @Column(DataType.INTEGER)
    ORT_NR!: number;

    @Column(DataType.INTEGER)
    ZNR_NR?: number; // Zielanzeige

    @Column(DataType.INTEGER)
    ANR_NR?: number; // Ansage

    @Column(DataType.INTEGER)
    EINFANGBEREICH?: number;

    @Column(DataType.BOOLEAN)
    LI_KNOTEN?: boolean;

    @Column(DataType.BOOLEAN)
    PRODUKTIV?: boolean;

    @Column(DataType.BOOLEAN)
    EINSTEIGEVERBOT?: boolean; // Was EINSTIEG_ERLAUBT (Inverted)

    @Column(DataType.BOOLEAN)
    AUSSTEIGEVERBOT?: boolean; // Was AUSSTIEG_ERLAUBT (Inverted)

    @Column(DataType.BOOLEAN)
    INNERORTSVERBOT?: boolean;

    @Column(DataType.BOOLEAN)
    BEDARFSHALT?: boolean;

    @BelongsTo(() => BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false })
    basisVersion?: BasisVersion;

    @BelongsTo(() => RecLid, { foreignKey: 'LI_NR', targetKey: 'LI_NR' })
    line?: RecLid;

    @BelongsTo(() => RecOrt, { foreignKey: 'ORT_NR', targetKey: 'ORT_NR', as: 'ort' })
    ort?: RecOrt;
}
