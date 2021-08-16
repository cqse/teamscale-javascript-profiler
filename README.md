# Teamscale JavaScript Profiler

This is a mono repository that includes all components to instrument 
JavaScript applications in order to collect coverage information and the tools
for aggregating this information and sending it to Teamscale.

## Preparing your Application

This section will discuss the adjustments to Cross-Origin Resource Sharing (CORS)
needed to allow for forwarding coverage to another socket.

## Contributing

We welcome any contributions to this project. Feel free to send us pull requests,
bug tickets, or feature requests.

## Publishing

The following steps have to be taken to publish the packages from this repository in `nodejs.org`.

1. Ensure that the version to release was built successfully, the code was reviewed
  by the responsible team, and that all tests and automatic quality checks pass.

2. Login with a user that has permissions to publish packages for the organizations
`@teamscale` and `@cqse` using:

```
npm login
```

Publish the chosen package using the following command:

```
yarn publish
```

Please note that the published versions of the packages might not be available 
immediately if a registry other than npmjs is used to retrieve them.
This might be the case if your organization uses products 
like the Nexus Repository Manager.
