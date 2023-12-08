'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Investment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Company)
      // this.belongsToMany(models.User,{
      //   through : models.UserInvestment
      // })
      this.hasMany(models.UserInvestment);
    }
    get createdDate(){
      return this.createdAt.toISOString().split('T')[0]
    }
  }
  Investment.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    investmentName: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notEmpty:{
          msg:`Investment Name harus diisi`
        }
      }
    },
    investmentAmount: {
      type:DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notEmpty:{
          msg:`Investment Amount harus diisi`
        }
      }
    },
    investmentType: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notEmpty:{
          msg:`Investment Type harus dipilih`
        },
        notNull:{
          msg:`Investment Type harus dipilih`
        }
      }
    },
    CompanyId:{
      type:DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notEmpty:{
          msg:`Company harus dipilih`
        },
        notNull:{
          msg:`Company Type harus dipilih`
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Investment',
  });
  return Investment;
};