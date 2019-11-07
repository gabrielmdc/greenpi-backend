const body = `
type Measure {
  id: ID!
  date: String!
  sensor: ID!
  value: Int!
}

input MeasureFilter {
  gte: String
  lte: String
  sortBy: String
}

input AddMeasureData {
  date: String!
  sensor: ID!
  value: Int!
}
`;
const query = `
fetchMeasures(by: String!, id: ID!, filter: MeasureFilter): [Measure!]!
getMeasure(id: ID!): Measure!
`;
const mutation = `
addMeasure(MeasureData: AddMeasureData!): Measure!
deleteMeasure(id: ID!): Measure!
`;

const schema: PreGraphqlSchema = {
  body,
  query,
  mutation
};

export default schema;
