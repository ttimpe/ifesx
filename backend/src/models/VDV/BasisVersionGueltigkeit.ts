import { Column, DataType, HasMany, Model, PrimaryKey, Table, ForeignKey, BelongsTo } from "sequelize-typescript"
import { BasisVersion } from "./BasisVersion"


@Table({
    timestamps: false,
    tableName: 'BASIS_VER_GUELTIGKEIT'
})
export class BasisVersionGueltigkeit extends Model {
    // Gültigkeit ab, Datum im Format YYYYMMDD
    @PrimaryKey
    @Column(DataType.INTEGER)
    VER_GUELTIGKEIT!: number

    @PrimaryKey
    @ForeignKey(() => BasisVersion)
    @Column(DataType.INTEGER)
    BASIS_VERSION!: number

    @BelongsTo(() => BasisVersion)
    basisVersion?: BasisVersion
}