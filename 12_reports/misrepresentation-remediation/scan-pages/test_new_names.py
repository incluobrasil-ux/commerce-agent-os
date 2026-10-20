import unicodedata
def norm(s):
    s=''.join(c for c in unicodedata.normalize('NFD',s) if unicodedata.category(c)!='Mn').lower()
    return ' '+s.replace('-',' ')+' '
# Full blocklist (ALTO + MEDIO clinical/therapeutic) from scan.py
BLOCK=["autismo","autista","espectro autista","tdah"," tda "," tea ","hiperatividade",
 "deficit de atencao","sindrome de down","dislexia","disgrafia","discalculia",
 "proprioceptiv","propriocepcao","oral motor","reflexolog","acupress","acupuntura",
 "integracao sensorial","terapia","terapeutic","terapeuta","fonoaudiolog","psicolog",
 "psicopedagog","deficiencia","deficiente","necessidades especiais","necessidades sensoriais",
 "transtorno","diagnostic","tratamento","sintoma","neurologic","neurodivergente","neuroatipic",
 "reabilitacao","paralisia"," avc ","estimulo proprioceptivo","estimulo tatil","estimulo sensorial",
 "estimulo cognitivo","pecs","sensorial","estimulo","estimulacao","regulacao emocional",
 "autorregulacao","desenvolvimento","ansiedade","calmante","concentracao"]
# Proposed new base names per product (numbered NN appended at runtime)
proposed={
 "fidget-pad-controlador-sensorial-foco":("fidget-pad-controle-botoes",15),
 "cubo-infinito-sensorial-fidget":("cubo-infinito-fidget-metal",13),
 "slime-sensorial-reutilizavel-massa-cristal-foco":("massa-modelar-cristal-elastica",12),
 "cubo-fidget-12-lados-foco-conforto-tatil":("cubo-fidget-12-lados",10),
 "mini-trampolim-sensorial-desenvolvimento-motor-proprioceptivo":("mini-trampolim-infantil-48pol",6),
}
bad=False
for h,(base,n) in proposed.items():
    for i in range(1,n+1):
        fn=f"{base}-{i:02d}.webp"
        nf=norm(fn)
        hits=[b for b in BLOCK if b in nf]
        if hits:
            bad=True; print("FAIL",fn,hits)
    print(f"OK  {base}-NN.webp  ({n} imgs)  -> no blocklist hit")
print("\nALL CLEAN" if not bad else "\nHAS FAILURES")
