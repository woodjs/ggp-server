module.exports = (sequelize, DataTypes) => {
	const NotificationOption = sequelize.define(
		'NotificationOption',
		{
			userId: {
				type: DataTypes.INTEGER,
			},
			typeId: { type: DataTypes.INTEGER, allowNull: false },
			auth: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			newPartner: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			refBonus: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			profit: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			buy: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			sell: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			transferReceipt: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			transferSend: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			bonus: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			newStatus: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			timestamps: false,
			tableName: 'notification_option',
		}
	);
	NotificationOption.associate = (models) => {
		NotificationOption.belongsTo(models.NotificationType, {
			foreignKey: 'typeId',
			onDelete: 'cascade',
		});
	};
	return NotificationOption;
};
