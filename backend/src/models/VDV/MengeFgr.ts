import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { BasisVersion } from "./BasisVersion";

@Table({
    tableName: 'MENGE_FGR',
    timestamps: false
})
export class MengeFgr extends Model {
    @PrimaryKey
    @ForeignKey(() => BasisVersion)
    @Column({
        type: DataType.INTEGER,
        defaultValue: 1
    })
    BASIS_VERSION!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    FGR_NR!: number;

    @Column(DataType.STRING(10))
    STR_FGR?: string;

    @Column(DataType.STRING(40))
    FGR_TEXT?: string;

    @BelongsTo(() => BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false })
    basisVersion?: BasisVersion;
}
