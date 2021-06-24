void update (int ind, int l, int r, int pos, int val) {
    if (l==r) { // стигнахме листото, което отговаря за променения елемент на масива
        tree[ind]=val;
        return ;
    }
    int mid=(l+r)/2;
    if (pos<=mid) update(2*ind,l,mid,pos,val);
    else update(2*ind+1,mid+1,r,pos,val);
    tree[ind]=tree[2*ind]+tree[2*ind+1];
}