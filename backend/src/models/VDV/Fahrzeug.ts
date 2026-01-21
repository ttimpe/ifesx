import { Model, Table, Column, DataType, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { MengeFzgTyp } from './MengeFzgTyp';

@Table({
    tableName: 'FAHRZEUG',
    timestamps: false
})
export class Fahrzeug extends Model {
    @PrimaryKey
    @Column(DataType.INTEGER)
    BASIS_VERSION!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    FZG_NR!: number;

    @ForeignKey(() => MengeFzgTyp)
    @Column(DataType.INTEGER)
    FZG_TYP_NR!: number;

    @Column(DataType.INTEGER)
    UNTERNEHMEN?: number;

    @Column(DataType.STRING(40))
    FZG_TEXT?: string;

    @Column(DataType.STRING(20))
    POLKENN?: string;

    @Column(DataType.STRING(17))
    FIN?: string;

    @BelongsTo(() => MengeFzgTyp, {
        foreignKey: 'FZG_TYP_NR',
        targetKey: 'FZG_TYP_NR',
        constraints: false
    })
    type?: MengeFzgTyp;
}
