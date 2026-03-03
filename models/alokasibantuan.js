'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AlokasiBantuan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // ? berguna untuk melakukan join antar tabel
      this.belongsTo(models.MasterSekolah);
      this.hasMany(models.SptjmTransaksi);
    }
  }
  AlokasiBantuan.init({
    MasterSekolahId: DataTypes.INTEGER,
    tahun: DataTypes.STRING,
    tahap: {
      type: DataTypes.ENUM('1', '2'),
      allowNull: false
    },
    jumlah_penerima: DataTypes.INTEGER,
    status_usulan: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'AlokasiBantuan',
  });
  return AlokasiBantuan;
};