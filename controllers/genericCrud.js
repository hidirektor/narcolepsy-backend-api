const {v4: uuidv4} = require('uuid');
const {object} = require("joi");

class GenericCRUD {
    constructor({model = null, where = null}) {
        this.model = model;
        this.setWhere(where);
    }

    getWhere() {
        return this.where;
    }

    setWhere(where) {
        this.where = where || {};
    }

    async create(data) {
        try {
            if (!this.model) {
                throw new Error("Model is not defined");
            }

            const body = Object.assign(data, this.where);
            console.error("body", body);

            const newItem = await this.model.create(body);
            return { status: true, result: newItem };

        } catch (error) {
            console.error("Error creating item:", error);
            return { status: false, result: error };
        }
    }

    async getAll() {
        const items = await this.model.findAll({where: this.where});
        this.setWhere();
        return items;
    }

    async findOne(object) {
        try {
            const { where, order } = object;
            const query = {
                where: Object.assign(where, this.where),
                order: order || [],
            };

            const item = await this.model.findOne(query);
            this.setWhere();

            if (!item) {
                return { status: false, result: 'Item not found' };
            }

            return { status: true, result: item };
        } catch (error) {
            return { status: false, result: error.message || 'An error occurred while retrieving the item' };
        }
    }


    async update(object, data) {
        try {
            const where = Object.assign({}, this.where, object.where);

            const [affectedRows] = await this.model.update(data, { where });

            if (affectedRows === 0) {
                return { status: false, result: 'Item not found or no changes made' };
            }

            return { status: true, result: 'Item updated successfully' };
        } catch (error) {
            return { status: false, result: `Unable to update item: ${error.message}` };
        }
    }


    async delete(object) {
        const where = Object.assign(object, this.where);
        const item = await this.model.findOne({where: where});
        this.setWhere();

        if (!item) {
            return {status: false, result: 'Item not found'};
        }
        try {
            await item.destroy();
            return {status: true, result: item};
        } catch (error) {
            return {status: false, result: 'Unable to delete item'};
        }
    }
}

module.exports = GenericCRUD