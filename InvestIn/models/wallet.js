'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.User)
    }
  }
  Wallet.init({
    money: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Wallet',
  });
  Wallet.beforeCreate((instance,option)=>{
    instance.money=0
  })
  return Wallet;
};