package module5_np;

import java.util.ArrayList;
import java.util.List;

/**
 * Module 5: NP-Completeness & Approximation
 * - Vertex Cover 2-Approximation using maximal matching: O(V + E)
 */
public class VertexCoverAlgorithm {

    public static List<Integer> vertexCoverApproximation(int[][] edges, int numVertices) {
        boolean[] visited = new boolean[numVertices];
        List<Integer> vertexCover = new ArrayList<>();

        for (int[] edge : edges) {
            int u = edge[0];
            int v = edge[1];
            if (!visited[u] && !visited[v]) {
                visited[u] = true;
                visited[v] = true;
                vertexCover.add(u);
                vertexCover.add(v);
            }
        }
        return vertexCover;
    }
}
