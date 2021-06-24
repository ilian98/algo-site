vector <int> a[MAXN];
bool visited[MAXN];
void dfs (int vr) {
    visited[vr]=true;
    for (auto to : a[vr]) {
        if (visited[to]==false) dfs(to);
    }
}