<!-- Freeki metadata. Do not remove this section!
TITLE: Main
-->
#Main

The graph database in the Atlas API is a directed, acyclic graph specification that stores information about specific relationships between GAVs, along with metadata attached to GAVs. It also stores some limited state information for each GAV:

- whether its own relationships have been resolved
- whether its version is variable *(eg. snapshot or version range)* or concrete

Additionally, most operations on the graph allow specification of a graph *view*, which contains:

- roots for the view (starting points for any paths and traversals)
- a filter (for narrowing the paths and relationships returned)

The graph db must support several basic functions:

- adding relationships (no view involved)
- getting the list of GAVs matching a given GA
- getting the list of missing GAVs
- getting the list of variable GAVs
- getting all paths between two GAVs, or from the view's root GAVs to a set of specified GAVs
- determining whether a GAV is present in the view of the db
- traversing the graph from a given set of starting GAVs
- selecting a different GAV to replace an existing GAV *(usually to select a concrete version for a range)*
- selecting a GAV to replace all occurrences of a given GA *(to mimic the closest-wins version collision mitigating that Maven uses, for instance)*
- determine whether a given new relationship would introduce a relationship cycle to the graph if it were added
- getting the cycles detected during add operations to the graph
- getting all relationships contained within the db, constrained by the view
- getting all GAVs contained within the db, constrained by the view
- getting/setting metadata key-value map attached to a given GAV
- other various query methods for shorthanding the `X foo = getXXX(...); return foo == null;` process

## Differentiating missing GAVs from GAVs that have no relationships

While it's extremely unusual for a project not to have ANY expressed relationships in its pom.xml at all (not even plugins), it IS possible that not all relationships will be added to the database. To this end, we need a mechanism to determine whether a project has been added to the graph, but had no relationships vs. a project that has not been accounted for at all.

To do this, we can add a ParentRelationship from a GAV to itself. The ParentRelationship class has a constructor for this very purpose, with only one ProjectVersionRef (GAV) parameter. These self-referential relationships are normally filtered out of any traversal or other result returned from the graph (NOT from getAllRelationships() or replication of the db via the API would be basically impossible).