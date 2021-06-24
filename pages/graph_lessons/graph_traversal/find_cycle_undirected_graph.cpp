bool dfs (int vr, int prev) {
    visited[vr]=true;
    for (auto to : a[vr]) {
        if (to==prev) continue; /// Пропускаме върха, от който сме дошли
        if (visited[to]==true) return true;
        if (dfs(to,vr)==true) return true;
    }
    return false;
}