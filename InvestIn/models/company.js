'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Investment)
    }
  }
  Company.init({
    companyName: DataTypes.STRING,
    companyLogo: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Company',
  });
  return Company;
};