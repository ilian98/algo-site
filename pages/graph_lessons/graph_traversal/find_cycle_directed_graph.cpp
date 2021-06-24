int states[MAXN];
bool dfs (int vr) {
    states[vr]=1;
    for (auto to : a[vr]) {
        if (states[vr]==1) return true;
        if (states[vr]==2) continue; /// Връх, който не е от текущия път и вече сме го обходили
        if (dfs(to,vr)==true) return true;
    }
    states[vr]=2;
    return false;
}