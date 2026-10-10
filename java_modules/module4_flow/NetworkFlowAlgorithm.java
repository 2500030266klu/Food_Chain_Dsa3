package module4_flow;

import java.util.LinkedList;
import java.util.Queue;

/**
 * Module 4: Network Flow
 * - Edmonds-Karp Maximum Flow (BFS Ford-Fulkerson): O(V * E^2)
 */
public class NetworkFlowAlgorithm {

    public static int edmondsKarp(int[][] capacity, int source, int sink) {
        int v = capacity.length;
        int[][] residual = new int[v][v];
        for (int i = 0; i < v; i++) {
            System.arraycopy(capacity[i], 0, residual[i], 0, v);
        }

        int[] parent = new int[v];
        int maxFlow = 0;

        while (bfsFlow(residual, source, sink, parent)) {
            int pathFlow = Integer.MAX_VALUE;
            for (int curr = sink; curr != source; curr = parent[curr]) {
                int prev = parent[curr];
                pathFlow = Math.min(pathFlow, residual[prev][curr]);
            }
            for (int curr = sink; curr != source; curr = parent[curr]) {
                int prev = parent[curr];
                residual[prev][curr] -= pathFlow;
                residual[curr][prev] += pathFlow;
            }
            maxFlow += pathFlow;
        }
        return maxFlow;
    }

    private static boolean bfsFlow(int[][] residual, int source, int sink, int[] parent) {
        boolean[] visited = new boolean[residual.length];
        Queue<Integer> queue = new LinkedList<>();
        queue.add(source);
        visited[source] = true;
        parent[source] = -1;

        while (!queue.isEmpty()) {
            int u = queue.poll();
            for (int v = 0; v < residual.length; v++) {
                if (!visited[v] && residual[u][v] > 0) {
                    if (v == sink) {
                        parent[v] = u;
                        return true;
                    }
                    queue.add(v);
                    parent[v] = u;
                    visited[v] = true;
                }
            }
        }
        return false;
    }
}
