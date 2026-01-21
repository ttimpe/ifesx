import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { BasisVersion } from "./BasisVersion";
import { RecUms } from "./RecUms";
import { RecOrt } from "./RecOrt";
import { RecLid } from "./RecLid";

@Table({
    tableName: 'EINZELANSCHLUSS',
    timestamps: false
})
export class Einzelanschluss extends Model {
    @PrimaryKey
    @ForeignKey(() => BasisVersion)
    @Column({
        type: DataType.INTEGER,
        defaultValue: 1
    })
    BASIS_VERSION!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    EINAN_NR!: number;

    @Column(DataType.CHAR(40))
    ANSCHLUSS_NAME?: string;

    @Column(DataType.CHAR(6))
    ANSCHLUSS_GRUPPE?: string;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0
    })
    LEITSTELLENKENNUNG!: number;

    // --- ZUBRINGER (Feeder) ---
    @Column(DataType.INTEGER)
    ZUB_LI_NR!: number;

    @Column(DataType.INTEGER)
    ZUB_LI_RI_NR!: number;

    @ForeignKey(() => RecOrt)
    @Column(DataType.INTEGER)
    ZUB_ORT_REF_ORT!: number;

    @Column(DataType.INTEGER)
    ZUB_ONR_TYP_NR?: number; // Optional

    @Column(DataType.INTEGER)
    ZUB_ORT_NR?: number; // Optional

    @Column(DataType.INTEGER)
    VON_ORT_REF_ORT?: number; // Optional

    // --- ABBRINGER (Fetcher) ---
    @Column(DataType.INTEGER)
    ABB_LI_NR!: number;

    @Column(DataType.INTEGER)
    ABB_LI_RI_NR!: number;

    @ForeignKey(() => RecOrt)
    @Column(DataType.INTEGER)
    ABB_ORT_REF_ORT!: number;

    @Column(DataType.INTEGER)
    ABB_ONR_TYP_NR?: number; // Optional

    @Column(DataType.INTEGER)
    ABB_ORT_NR?: number; // Optional

    @Column(DataType.INTEGER)
    NACH_ORT_REF_ORT?: number; // Optional

    // --- ASBID ---
    @Column(DataType.CHAR(10))
    ASBID?: string;


    // --- Associations ---
    @BelongsTo(() => BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false })
    basisVersion?: BasisVersion;

    @HasMany(() => RecUms, {
        foreignKey: 'EINAN_NR',
        sourceKey: 'EINAN_NR',
        constraints: false
    })
    recUms?: RecUms[];

    // Relation helps for eager loading names if needed, though composite keys make it tricky
}
