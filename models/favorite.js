const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);


var favouriteSchema = new Schema({
    favDish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});


var Favourites = mongoose.model('Favourites', favouriteSchema);

module.exports = Favourites;