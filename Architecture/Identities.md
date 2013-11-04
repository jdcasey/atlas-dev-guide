<!-- Freeki metadata. Do not remove this section!
TITLE: Identities
-->
#Identities

Identities are critical to the Atlas APIs, as they define the different aspects of a project that we might reference, and provide the building blocks for creating relationships between projects.

## Projects

A project is a codebase segment that is releasable. They can have multiple releases, each with zero or more artifacts (files) associated. In common terms, a project equates to the `groupId` and `artifactId` **(GA)** under which released versions are organized. When your project upgrades from one version of a dependency to another, the version may change but the **project** does not.

Projects are captured by the class: `ProjectRef`

## Project Releases

Projects (hopefully) have releases. Each release is meant to be a fixed, immutable point in the history of the project, and as such contains the Project reference (GA) *and* a version, leading to the commonly referred-to triple-coordinate **GAV**. Project releases can still contain multiple artifacts (files). Using Maven, a project release will normally contain at least something like a jar file along with the dual metadata/artifact file that is the Maven POM, which contains information about how the project's release is related to other projects (and their releases).

The fact that the POM files normally accompanies the main project artifacts is what enables the automatic discovery of a project-relationship graph, which is the purview of the Atlas Relationship API and its embedded graphing API.

Project releases are captured by the class: `ProjectVersionRef`

## Project Artifacts

'Artifact' is the Maven term for a file associated with a particular version of a project. The version may be a pre-release snapshot, in which case each deployment will get a timestamped version qualifier. Whatever the version, each artifact file is meant to be unique within that project version. Artifacts build on the GAV of the project itself, adding an optional classifier (C) and a type, or file extension (T). This makes each artifact fully addressable using its unique GAVT[C].

When a Maven POM contains a `<dependency>` declaration, it's really referencing an artifact. If the `<type>` is not specified, it defaults to `jar`, and of course the classifier is an optional field. This addressability is what allows Maven users to abstractly specify their dependence on the products of other project releases. Without it, Maven could not resolve the ambiguity of versions, or files within a version, of a project, and we'd be stuck with the old Ant practice of downloading dependency binaries into an embedded `lib/` directory (where they often become semi-anonymous, losing their version information) within our own project directory.

## Comparing Artifacts without Versions

Many people incorrectly assume that managed dependencies are matched up with direct dependencies using the GA (groupId/artifactId) of the artifact. However, if they make use of multiple artifact types in their projects, they soon find that each type (and classifier!) used has to be declared separately in the managed dependencies in order to centralize version, scope, and exclusion information.

This is an example of using the artifact's coordinate **in a versionless way**. Another example is Maven's algorithm for avoiding duplication when it builds the classpath for a project. Consider the following situation:

- Your project (org.myco:A), version 0.1, depends on org.foo:B-1.0 and org.bar:C-2.0:

```
org.myco:A-0.1 -> org.foo:B-1.0
org.myco:A-0.1 -> org.bar:C-1.0
```

- Project org.foo:B, version 1.0, depends on project org.test:D 1.1:

```
org.foo:B-1.0 -> org.test:D-1.1
```

- Project org.bar:C, version *1.0*, also depended on project org.test:D 1.1:

```
org.bar:C-1.0 -> org.test:D-1.1
```

- **HOWEVER**, you're not using org.bar:C-1.0, you're using org.bar:C-2.0. In developing org.bar:C-2.0, they upgraded to version 1.2 of project org.test:D:

```
org.bar:C-2.0 -> org.test:D-1.2
```

When you try to build your project (org.myco:A-0.1), your build system will have to make sense of the conflicting versions of project org.test:D in your dependency graph. To detect this conflict, the build system would need to construct a "seen" set of project artifacts *that ignores the versions*, then decide which version "wins" between two or more conflicting versions.

