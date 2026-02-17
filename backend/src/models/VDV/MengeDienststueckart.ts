import { Table, Column, Model, DataType, PrimaryKey, ForeignKey } from 'sequelize-typescript';
import { BasisVersion } from './BasisVersion';

@Table({
    tableName: 'MENGE_DIENSTSTUECKART',
    timestamps: false
})
export class MengeDienststueckart extends Model {
    @PrimaryKey
    @ForeignKey(() => BasisVersion)
    @Column({
        type: DataType.INTEGER,
        defaultValue: 1
    })
    BASIS_VERSION!: number;

    @PrimaryKey
    @Column(DataType.STRING(10))
    DIENSTSTUECKART!: string;

    @Column(DataType.STRING(40))
    DIENSTSTUECKART_TEXT?: string;
}
