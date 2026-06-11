export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const SitePartsFragmentDoc = gql`
    fragment SiteParts on Site {
  __typename
  instagramHandle
  adminEmail
  contact {
    __typename
    email
    phone
    address {
      __typename
      sv
      en
    }
    socials {
      __typename
      label
      url
    }
  }
  navigation {
    __typename
    key
    sv
    en
    href
  }
  hero {
    __typename
    title {
      __typename
      sv
      en
    }
    intro {
      __typename
      sv
      en
    }
    images
  }
  sections {
    __typename
    about {
      __typename
      eyebrow {
        __typename
        sv
        en
      }
      title {
        __typename
        sv
        en
      }
      body {
        __typename
        sv
        en
      }
    }
    food {
      __typename
      eyebrow {
        __typename
        sv
        en
      }
      title {
        __typename
        sv
        en
      }
      body {
        __typename
        sv
        en
      }
    }
    restaurant {
      __typename
      eyebrow {
        __typename
        sv
        en
      }
      title {
        __typename
        sv
        en
      }
      body {
        __typename
        sv
        en
      }
    }
    merch {
      __typename
      eyebrow {
        __typename
        sv
        en
      }
      title {
        __typename
        sv
        en
      }
      body {
        __typename
        sv
        en
      }
    }
    reservations {
      __typename
      eyebrow {
        __typename
        sv
        en
      }
      title {
        __typename
        sv
        en
      }
      body {
        __typename
        sv
        en
      }
    }
    instagram {
      __typename
      eyebrow {
        __typename
        sv
        en
      }
      title {
        __typename
        sv
        en
      }
      body {
        __typename
        sv
        en
      }
    }
    footer {
      __typename
      eyebrow {
        __typename
        sv
        en
      }
      title {
        __typename
        sv
        en
      }
      body {
        __typename
        sv
        en
      }
    }
  }
  history {
    __typename
    eyebrow {
      __typename
      sv
      en
    }
    title {
      __typename
      sv
      en
    }
    body {
      __typename
      sv
      en
    }
    drawerText {
      __typename
      sv
      en
    }
    images {
      __typename
      src
      caption {
        __typename
        sv
        en
      }
      credit
    }
  }
}
    `;
export const MenusPartsFragmentDoc = gql`
    fragment MenusParts on Menus {
  __typename
  language
  title
  background
  groups {
    __typename
    category
    items {
      __typename
      name
      description
      price
      image
    }
  }
}
    `;
export const ProductsPartsFragmentDoc = gql`
    fragment ProductsParts on Products {
  __typename
  products {
    __typename
    id
    sku
    name {
      __typename
      sv
      en
    }
    description {
      __typename
      sv
      en
    }
    priceSek
    image
    active
  }
}
    `;
export const PhotographyPartsFragmentDoc = gql`
    fragment PhotographyParts on Photography {
  __typename
  food
  restaurant
}
    `;
export const SiteDocument = gql`
    query site($relativePath: String!) {
  site(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...SiteParts
  }
}
    ${SitePartsFragmentDoc}`;
export const SiteConnectionDocument = gql`
    query siteConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: SiteFilter) {
  siteConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...SiteParts
      }
    }
  }
}
    ${SitePartsFragmentDoc}`;
export const MenusDocument = gql`
    query menus($relativePath: String!) {
  menus(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...MenusParts
  }
}
    ${MenusPartsFragmentDoc}`;
export const MenusConnectionDocument = gql`
    query menusConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: MenusFilter) {
  menusConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...MenusParts
      }
    }
  }
}
    ${MenusPartsFragmentDoc}`;
export const ProductsDocument = gql`
    query products($relativePath: String!) {
  products(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...ProductsParts
  }
}
    ${ProductsPartsFragmentDoc}`;
export const ProductsConnectionDocument = gql`
    query productsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: ProductsFilter) {
  productsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...ProductsParts
      }
    }
  }
}
    ${ProductsPartsFragmentDoc}`;
export const PhotographyDocument = gql`
    query photography($relativePath: String!) {
  photography(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PhotographyParts
  }
}
    ${PhotographyPartsFragmentDoc}`;
export const PhotographyConnectionDocument = gql`
    query photographyConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PhotographyFilter) {
  photographyConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PhotographyParts
      }
    }
  }
}
    ${PhotographyPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    site(variables, options) {
      return requester(SiteDocument, variables, options);
    },
    siteConnection(variables, options) {
      return requester(SiteConnectionDocument, variables, options);
    },
    menus(variables, options) {
      return requester(MenusDocument, variables, options);
    },
    menusConnection(variables, options) {
      return requester(MenusConnectionDocument, variables, options);
    },
    products(variables, options) {
      return requester(ProductsDocument, variables, options);
    },
    productsConnection(variables, options) {
      return requester(ProductsConnectionDocument, variables, options);
    },
    photography(variables, options) {
      return requester(PhotographyDocument, variables, options);
    },
    photographyConnection(variables, options) {
      return requester(PhotographyConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "http://localhost:4001/graphql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
