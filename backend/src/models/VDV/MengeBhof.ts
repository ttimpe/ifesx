import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { BasisVersion } from "./BasisVersion";

@Table({
    tableName: 'MENGE_BHOF',
    timestamps: false
})
export class MengeBhof extends Model {
    @PrimaryKey
    @ForeignKey(() => BasisVersion)
    @Column({
        type: DataType.INTEGER,
        defaultValue: 1
    })
    BASIS_VERSION!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    BHOF_NR!: number;

    @Column(DataType.STRING(32))
    BHOF_TEXT?: string;

    @Column(DataType.STRING(10))
    STR_BHOF?: string;

    @BelongsTo(() => BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false })
    basisVersion?: BasisVersion;
}
