"""Divide o plano Lote 3 em batches de 25 e gera mutations com aliases."""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

plan = json.load(open(r"C:\projetos-incluo\commerce-agent-os\07_memory\vault\AUDITORIA-GMC-2026\snapshots\2026-06-14-pre-fix\lote3-plan.json", encoding='utf-8'))
items = plan['to_update']
BATCH = 10
batches = [items[i:i+BATCH] for i in range(0, len(items), BATCH)]
print(f"Total items: {len(items)}, batches: {len(batches)}")

out_dir = r"C:\projetos-incluo\commerce-agent-os\07_memory\vault\AUDITORIA-GMC-2026\snapshots\2026-06-14-pre-fix"
for i, b in enumerate(batches):
    # Build query
    decls = ", ".join([f"$p{j}: ProductUpdateInput!" for j in range(len(b))])
    fields = "\n".join([f"  a{j}: productUpdate(product: $p{j}) {{ product {{ id handle }} userErrors {{ field message }} }}" for j in range(len(b))])
    query = f"mutation U({decls}) {{\n{fields}\n}}"
    # Build variables
    variables = {f"p{j}": {"id": x['gid'], "descriptionHtml": x['new_desc']} for j, x in enumerate(b)}
    with open(f"{out_dir}/lote3-batch-{i+1}-query.gql", 'w', encoding='utf-8') as f:
        f.write(query)
    with open(f"{out_dir}/lote3-batch-{i+1}-vars.json", 'w', encoding='utf-8') as f:
        json.dump(variables, f, ensure_ascii=False)
    print(f"Batch {i+1}: {len(b)} items, vars size {sum(len(json.dumps(v,ensure_ascii=False)) for v in variables.values())} bytes")
