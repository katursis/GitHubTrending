class RepositoriesContainer {
    constructor(knex) {
        this.knex = knex;

        this.tableName = 'trending_repos';
    }

    open() {
        return this.knex
            .schema
            .createTableIfNotExists(this.tableName, table => {
                table.integer('id').unsigned().primary().notNullable();
                table.bool('published').notNullable();
                table.date('added_date').notNullable();
            });
    }

    add(id) {
        return this.knex(this.tableName)
            .insert({
                id,
                published: false,
                added_date: this.knex.raw('CURRENT_DATE')
            });
    }

    getNextUnpublished() {
        return this.knex(this.tableName)
            .where({published: false})
            .orderBy('added_date')
            .limit(1)
            .then(rows => {
                if (!rows.length) {
                    return null;
                }

                return rows[0].id;
            })
    }

    has(id) {
        return this.knex(this.tableName)
            .count('* as count')
            .where({id})
            .then(rows => {
                return rows[0].count !== 0;
            });
    }

    markAsPublished(id) {
        return this.knex(this.tableName)
            .update({published: true})
            .where({id});
    }
}

module.exports = RepositoriesContainer;
