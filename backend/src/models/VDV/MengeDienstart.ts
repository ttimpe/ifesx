import { Column, DataType, Model, PrimaryKey, Table, ForeignKey, BelongsTo } from "sequelize-typescript"
import { BasisVersion } from "./BasisVersion"

@Table({
    timestamps: false,
    tableName: 'MENGE_DIENSTART'
})
export class MengeDienstart extends Model {
    @PrimaryKey
    @ForeignKey(() => BasisVersion)
    @Column(DataType.INTEGER)
    BASIS_VERSION!: number

    @BelongsTo(() => BasisVersion)
    basisVersion?: BasisVersion

    @PrimaryKey
    @Column(DataType.INTEGER)
    DIENSTART_NR!: number

    @Column(DataType.STRING)
    DIENSTART_TEXT?: string
}
