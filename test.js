/**
 * Created by Maxime on 05/12/2014.
 */

var obj = {
    de: 'df',
    data: [
        {
            id: 'd',
            capacity: 10
        },
        {
            id: "df",
            capacity: 30
        }
    ]
};

for( var room in obj.data ){
    delete obj.data[room].capacity;
}

console.log(obj.data);