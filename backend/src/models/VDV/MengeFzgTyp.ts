import { Model, Table, Column, DataType, PrimaryKey, HasMany } from 'sequelize-typescript';
import { Fahrzeug } from './Fahrzeug';

@Table({
    tableName: 'MENGE_FZG_TYP',
    timestamps: false
})
export class MengeFzgTyp extends Model {
    @PrimaryKey
    @Column(DataType.INTEGER)
    BASIS_VERSION!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    FZG_TYP_NR!: number;

    @Column(DataType.STRING(40))
    FZG_TYP_TEXT?: string;

    @Column(DataType.INTEGER)
    FZG_LAENGE?: number; // In Metern

    @Column(DataType.INTEGER)
    FZG_TYP_BREITE?: number; // In cm

    @Column(DataType.INTEGER)
    FZG_TYP_HOEHE?: number; // In cm

    @Column(DataType.INTEGER)
    FZG_TYP_GEWICHT?: number; // In kg

    @Column(DataType.INTEGER)
    FZG_TYP_SITZ?: number;

    @Column(DataType.INTEGER)
    FZG_TYP_STEH?: number;

    @Column(DataType.INTEGER)
    SONDER_PLATZ?: number; // Behindertenplätze

    @Column(DataType.STRING(6))
    STR_FZG_TYP?: string;

    @Column(DataType.INTEGER)
    BATTERIE_TYP_NR?: number; // Optional

    @Column(DataType.INTEGER)
    VERBRAUCH_DISTANZ?: number; // Wh/km

    @Column(DataType.INTEGER)
    VERBRAUCH_ZEIT?: number; // Wh/h

    @HasMany(() => Fahrzeug, {
        foreignKey: 'FZG_TYP_NR',
        sourceKey: 'FZG_TYP_NR',
        constraints: false
    })
    vehicles?: Fahrzeug[];
}
