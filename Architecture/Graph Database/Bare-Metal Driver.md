<!-- Freeki metadata. Do not remove this section!
TITLE: Bare-Metal Driver
-->
#Bare-Metal Driver

* Graph stores:
    * `GAV -> out-relationship`
    * `GAV -> in-relationship`
    * `variable-GAV`
    * `incomplete-GAV`
    * `GAV -> metadata-map`
    * `GAV -> selectedGAV`
    * `GA -> selectedGAV`
    * `view -> visibility`
* GraphView stores:
    * `roots`
    * `rootFilter`
* GraphVisibility stores:
    * `view`
    * `accepted-path -> childFilters` *(derived from accepting filters)*
    * `accepted-GAV -> accepted-paths` *(ending with GAV as target)*
        * `view.getRoots() -> empty-set` *automatically included*
* PathDB stores:
    * `canonical-paths`

## Use Cases

### Traverse (with GraphView) 

#### With cached paths

1. Retrieve cached paths from view
2. Sort paths according to DFS/BFS needs
3. Iterate paths, calling Traversal api with each path
4. Repeat for #passes expressed by Traverse

**TODO:** How can we sort cached paths for DFS/BFS?

#### Without cached paths

1. Get view roots.
2. Get view filter.
3. Run traverse with DFS/BFS algorithm as needed by Traverse. On each successive relationship:
    0. Process relationship overrides to account for selectedGAVs (relocations)
    1. construct `filter` from `parentPath` using iterative calls to `accept()` and `getChildFilter()`
    2. if `filter` accepts current path, cache it in the view's associated visibility instance `GraphVisibility.cachePathAcceptance(path, acceptingFilter)`:
         0. Create visibility if non-existent, map `view -> visibility` in driver
         2. map `path.getEndGAV() -> path`
         3. map `path -> acceptingFilter`
4. Repeat for #passes expressed by Traverse

### Add Relationship

1. Map `declaringGAV -> relationship` in out-edges
2. Map `targetGAV -> relationship` in in-edges
3. Remove `declaringGAV` from `incompleteGAV` set
4. If `targetGAV` isn't already contained in `out-edges` map, add it to `incompleteGAV` set
5. If `targetGAV` is variable, add it to `variableGAV`
6. For each cached `view -> visibility` mapping, call `GraphVisibility.add( relationship, pathDb )`:
    1. If declaring GAV is in `viewRoots` AND relationship is accepted by `rootFilter` (or rootFilter is `null`):
         1. construct 1-edge path from `relationship`
         2. map `targetGAV -> newPath`
         3. map `newPath -> rootFilter.getChildFilter( relationship )`
    2. Lookup existing paths mapped to `declaringGAV` of `relationship`. For each:
         1. Lookup `filters` accepting this path. For each:
              1. if `filter` accepts relationship, add `filter.getChildFilter(relationship)` to temp `filters-set`
         2. If temp `filters-set` is not empty:
              1. extend `currentPath` with `relationship` to form a `newPath`
              2. map `targetGAV -> newPath`
              3. map `newPath -> filter-set`