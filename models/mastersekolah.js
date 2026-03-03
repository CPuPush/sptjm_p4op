'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MasterSekolah extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // ? berguna untuk melakukan join antar tabel
      this.hasMany(models.AlokasiBantuan);
    }
  }
  MasterSekolah.init({
    npsn: DataTypes.STRING,
    nama_sekolah: DataTypes.STRING,
    jenjang: DataTypes.STRING,
    wilayah: DataTypes.STRING,
    kecamatan: DataTypes.STRING,
    kelurahan: DataTypes.STRING,
    zona: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MasterSekolah',
  });
  return MasterSekolah;
};