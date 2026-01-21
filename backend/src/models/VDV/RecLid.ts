import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BasisVersion } from './BasisVersion';
import { RecZnr } from './RecZnr';

@Table({
    tableName: 'REC_LID',
    timestamps: false
})
export class RecLid extends Model {
    @PrimaryKey
    @Column({
        type: DataType.INTEGER,
        defaultValue: 1
    })
    BASIS_VERSION!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    LI_NR!: number;

    @PrimaryKey
    @Column(DataType.STRING(6))
    STR_LI_VAR!: string; // P3: Variant identifier

    @Column(DataType.INTEGER)
    ROUTEN_NR?: number; // Optional

    @Column(DataType.INTEGER)
    LI_RI_NR?: number; // 1 or 2

    @Column(DataType.INTEGER)
    BEREICH_NR?: number;

    @Column(DataType.STRING(6))
    LI_KUERZEL!: string; // Was STR_LID

    @Column(DataType.STRING(100))
    LIDNAME!: string; // Was LIN_NAME

    @Column(DataType.INTEGER)
    ROUTEN_ART?: number;

    @Column(DataType.INTEGER)
    LINIEN_CODE?: number;

    @Column(DataType.STRING(128))
    LinienID?: string; // T-LID

    @BelongsTo(() => BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false })
    basisVersion?: BasisVersion;
}
