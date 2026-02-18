import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BasisVersion } from './BasisVersion';

@Table({
    tableName: 'REC_ZNR',
    timestamps: false
})
export class RecZnr extends Model {
    @PrimaryKey
    @Column({
        type: DataType.INTEGER,
        defaultValue: 1
    })
    BASIS_VERSION!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    ZNR_NR!: number;

    @Column(DataType.TEXT)
    ZNR_TEXT!: string;

    @Column(DataType.STRING(10))
    ZNR_KUERZEL?: string;

    @Column(DataType.STRING(44))
    FAHRERKURZTEXT?: string;

    @Column(DataType.TEXT)
    SEITENTEXT?: string;

    @Column(DataType.STRING(68))
    ZNR_CODE?: string;

    @BelongsTo(() => BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false })
    basisVersion?: BasisVersion;

}
