import { Column, DataType, HasMany, Model, PrimaryKey, Table, ForeignKey, BelongsTo } from "sequelize-typescript"
import { BasisVersion } from "./BasisVersion"

@Table({
    timestamps: false,
    tableName: 'MENGE_TAGESART'
})
export class Tagesart extends Model {
    @PrimaryKey
    @ForeignKey(() => BasisVersion)
    @Column(DataType.INTEGER)
    BASIS_VERSION!: number

    @BelongsTo(() => BasisVersion)
    basisVersion?: BasisVersion

    @PrimaryKey
    @Column(DataType.INTEGER)
    TAGESART_NR!: number

    @Column(DataType.STRING)
    TAGESART_TEXT?: string

}