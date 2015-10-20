/**
 *
 * @param {json} options - options for prototype of custom element
 * @example, if it has no default value, then the value can be String/Object/
    {
        is: 'r-xxx'
        ready: function() {}
        created: function() {}
        attached: function() {}
        dettached: function() {}
        attributeChanged: function() {}
        extends: 'type name'
        properties: {
            aaa: 'string',//used for deserializezing from an attribute
            bbb: [],
            prop: {
                type: String,
                notify: true,
                readOnly: true
            }
        }
    }
 * @param options.properties.xxx.type - Boolean, Date, Number, String, Array or Object
 * @param options.properties.xxx.value - boolean, number, string or function
 * String. No serialization required.
 * Date or Number. Serialized using  toString.
 * Boolean. Results in a non-valued attribute to be either set (true) or removed (false).
 * Array or Object. Serialized using JSON.stringify.
 *
 */
function Rosetta(options) {

}

/*
 *
 */
function init() {

}

/*
 *
 */
function create() {

}

/*
 *
 */
function render() {

}

/*
 *
 */
function ready() {

}
