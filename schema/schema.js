const graphql = require('graphql');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

//==========================TYPES==========================//

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType), //must add 'new GraphQLList' because there are many users associated with the company
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then(res => res.data);
            }
        }
    })
})

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
               return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then(res => res.data);
            }
        }
    })
});

// const typeDefs = gql`
// type User {
//     _id: ID (String?)
//     firstName: String
//     age: Int
//     company: [company]!
// }

// type Company {
//     _id: ID (String?)
//     name: String
//     users: [user]!
// }`

// =======================================

// const resolvers = {
//     Query: {
//         users: async () => {
//             return User
//         },
//         user: async (parent, { username }) => {
//             return User.findOne({ username }).populate('companies');
//           },

//         companies: async (parent, { username }) => {
//             return Thought.find(params).sort({ createdAt: -1 });
//         },
//     }
// }

//==========================ROOT QUERYS==========================//

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/users/${args.id}`)
                    .then(resp => resp.data)
            }
        },

        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                    .then(resp => resp.data) //campatability between axios and graphQL, only return data and not entire resp object 
            }
        }
    }
});

//=========================MUTATION==========================//

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString }
            },
            resolve(parentValue, { firstName, age }) {
                return axios.post('http://localhost:3000/users',  { firstName, age })
                    .then(res => res.data);
            }
        },

        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parentValue, { id }) {
                return axios.delete(`http://localhost:3000/users/${id}`)
                    .then(res => res.data);
            }
        },

        editUser: {
            type: UserType, 
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) }, //id is required to change 
                firstName: {type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: {type: GraphQLString }
            },
            resolve(parentValue, args) {
                return axios.patch(`http://localhost:3000/users/${args.id}`, args)
                    .then(res => res.data);
            }
        }
    }
})

// Mutation: {
// addUser: async(parent, { username, email, password }) => {
//     return User.create({ firstName, age})
// }
// }

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});