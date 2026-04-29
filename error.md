 => ERROR [backend 7/7] RUN pip install --no-cache-dir .                                                                                                                                                                                                                75.2s 
 => [dashboard] resolving provenance for metadata file                                                                                                                                                                                                                   0.0s
------                                                                                                                                                                                                                                                                        
 > [backend 7/7] RUN pip install --no-cache-dir .:                                                                                                                                                                                                                            
1.294 Processing /app                                                                                                                                                                                                                                                         
1.296   Installing build dependencies: started                                                                                                                                                                                                                                
3.710   Installing build dependencies: finished with status 'done'                                                                                                                                                                                                            
3.710   Getting requirements to build wheel: started                                                                                                                                                                                                                          
3.870   Getting requirements to build wheel: finished with status 'done'
3.870   Preparing metadata (pyproject.toml): started
4.010   Preparing metadata (pyproject.toml): finished with status 'done'
4.677 Collecting fastapi>=0.110.0 (from commit-to-workflow==0.1.0)
5.035   Downloading fastapi-0.136.1-py3-none-any.whl.metadata (28 kB)
5.308 Collecting uvicorn>=0.27.0 (from commit-to-workflow==0.1.0)
5.356   Downloading uvicorn-0.46.0-py3-none-any.whl.metadata (6.7 kB)
5.661 Collecting pydantic>=2.6.0 (from commit-to-workflow==0.1.0)
5.740   Downloading pydantic-2.13.3-py3-none-any.whl.metadata (108 kB)
6.023 Collecting tree-sitter>=0.21.0 (from commit-to-workflow==0.1.0)
6.072   Downloading tree_sitter-0.25.2-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl.metadata (10.0 kB)
6.324 Collecting langgraph>=0.0.30 (from commit-to-workflow==0.1.0)
6.396   Downloading langgraph-1.1.10-py3-none-any.whl.metadata (8.0 kB)
6.453 Collecting temporalio>=1.5.0 (from commit-to-workflow==0.1.0)
6.626   Downloading temporalio-1.26.0-cp310-abi3-manylinux_2_17_aarch64.manylinux2014_aarch64.whl.metadata (101 kB)
6.821 Collecting instructor>=1.0.0 (from commit-to-workflow==0.1.0)
6.869   Downloading instructor-1.15.1-py3-none-any.whl.metadata (12 kB)
7.639 Collecting ruff>=0.3.0 (from commit-to-workflow==0.1.0)
7.698   Downloading ruff-0.15.12-py3-none-manylinux_2_17_aarch64.manylinux2014_aarch64.whl.metadata (26 kB)
7.775 Collecting starlette>=0.46.0 (from fastapi>=0.110.0->commit-to-workflow==0.1.0)
7.822   Downloading starlette-1.0.0-py3-none-any.whl.metadata (6.3 kB)
7.990 Collecting typing-extensions>=4.8.0 (from fastapi>=0.110.0->commit-to-workflow==0.1.0)
8.052   Downloading typing_extensions-4.15.0-py3-none-any.whl.metadata (3.3 kB)
8.100 Collecting typing-inspection>=0.4.2 (from fastapi>=0.110.0->commit-to-workflow==0.1.0)
8.153   Downloading typing_inspection-0.4.2-py3-none-any.whl.metadata (2.6 kB)
8.243 Collecting annotated-doc>=0.0.2 (from fastapi>=0.110.0->commit-to-workflow==0.1.0)
8.294   Downloading annotated_doc-0.0.4-py3-none-any.whl.metadata (6.6 kB)
9.126 Collecting aiohttp<4.0.0,>=3.9.1 (from instructor>=1.0.0->commit-to-workflow==0.1.0)
9.202   Downloading aiohttp-3.13.5-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl.metadata (8.1 kB)
9.262 Collecting docstring-parser<1.0,>=0.16 (from instructor>=1.0.0->commit-to-workflow==0.1.0)
9.319   Downloading docstring_parser-0.18.0-py3-none-any.whl.metadata (3.5 kB)
9.429 Collecting jinja2<4.0.0,>=3.1.4 (from instructor>=1.0.0->commit-to-workflow==0.1.0)
9.484   Downloading jinja2-3.1.6-py3-none-any.whl.metadata (2.9 kB)
9.709 Collecting jiter<0.14,>=0.6.1 (from instructor>=1.0.0->commit-to-workflow==0.1.0)
9.774   Downloading jiter-0.13.0-cp312-cp312-manylinux_2_17_aarch64.manylinux2014_aarch64.whl.metadata (5.2 kB)
9.912 Collecting openai<3.0.0,>=2.0.0 (from instructor>=1.0.0->commit-to-workflow==0.1.0)
9.973   Downloading openai-2.33.0-py3-none-any.whl.metadata (31 kB)
11.13 Collecting pydantic-core<3.0.0,>=2.18.0 (from instructor>=1.0.0->commit-to-workflow==0.1.0)
11.19   Downloading pydantic_core-2.46.3-cp312-cp312-manylinux_2_17_aarch64.manylinux2014_aarch64.whl.metadata (6.6 kB)
11.30 Collecting requests<3.0.0,>=2.32.3 (from instructor>=1.0.0->commit-to-workflow==0.1.0)
11.35   Downloading requests-2.33.1-py3-none-any.whl.metadata (4.8 kB)
11.53 Collecting rich<15.0.0,>=13.7.0 (from instructor>=1.0.0->commit-to-workflow==0.1.0)
11.59   Downloading rich-14.3.4-py3-none-any.whl.metadata (18 kB)
11.69 Collecting tenacity<10.0.0,>=8.2.3 (from instructor>=1.0.0->commit-to-workflow==0.1.0)
11.75   Downloading tenacity-9.1.4-py3-none-any.whl.metadata (1.2 kB)
11.89 Collecting typer<1.0.0,>=0.9.0 (from instructor>=1.0.0->commit-to-workflow==0.1.0)
11.94   Downloading typer-0.25.0-py3-none-any.whl.metadata (15 kB)
12.26 Collecting langchain-core<2,>=1.3.0 (from langgraph>=0.0.30->commit-to-workflow==0.1.0)
12.31   Downloading langchain_core-1.3.2-py3-none-any.whl.metadata (4.4 kB)
12.37 Collecting langgraph-checkpoint<5.0.0,>=2.1.0 (from langgraph>=0.0.30->commit-to-workflow==0.1.0)
12.42   Downloading langgraph_checkpoint-4.0.3-py3-none-any.whl.metadata (5.2 kB)
12.56 Collecting langgraph-prebuilt<1.1.0,>=1.0.12 (from langgraph>=0.0.30->commit-to-workflow==0.1.0)
12.62   Downloading langgraph_prebuilt-1.0.12-py3-none-any.whl.metadata (5.2 kB)
12.77 Collecting langgraph-sdk<0.4.0,>=0.3.0 (from langgraph>=0.0.30->commit-to-workflow==0.1.0)
12.84   Downloading langgraph_sdk-0.3.13-py3-none-any.whl.metadata (1.6 kB)
13.28 Collecting xxhash>=3.5.0 (from langgraph>=0.0.30->commit-to-workflow==0.1.0)
13.34   Downloading xxhash-3.7.0-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl.metadata (13 kB)
13.45 Collecting annotated-types>=0.6.0 (from pydantic>=2.6.0->commit-to-workflow==0.1.0)
13.51   Downloading annotated_types-0.7.0-py3-none-any.whl.metadata (15 kB)
13.62 Collecting nexus-rpc==1.4.0 (from temporalio>=1.5.0->commit-to-workflow==0.1.0)
13.67   Downloading nexus_rpc-1.4.0-py3-none-any.whl.metadata (2.9 kB)
13.99 Collecting protobuf<7.0.0,>=3.20 (from temporalio>=1.5.0->commit-to-workflow==0.1.0)
14.04   Downloading protobuf-6.33.6-cp39-abi3-manylinux2014_aarch64.whl.metadata (593 bytes)
14.10 Collecting types-protobuf<7.0.0,>=3.20 (from temporalio>=1.5.0->commit-to-workflow==0.1.0)
14.27   Downloading types_protobuf-6.32.1.20260221-py3-none-any.whl.metadata (2.2 kB)
14.43 Collecting click>=7.0 (from uvicorn>=0.27.0->commit-to-workflow==0.1.0)
14.51   Downloading click-8.3.3-py3-none-any.whl.metadata (2.6 kB)
14.55 Collecting h11>=0.8 (from uvicorn>=0.27.0->commit-to-workflow==0.1.0)
14.61   Downloading h11-0.16.0-py3-none-any.whl.metadata (8.3 kB)
14.72 Collecting aiohappyeyeballs>=2.5.0 (from aiohttp<4.0.0,>=3.9.1->instructor>=1.0.0->commit-to-workflow==0.1.0)
14.77   Downloading aiohappyeyeballs-2.6.1-py3-none-any.whl.metadata (5.9 kB)
14.86 Collecting aiosignal>=1.4.0 (from aiohttp<4.0.0,>=3.9.1->instructor>=1.0.0->commit-to-workflow==0.1.0)
14.91   Downloading aiosignal-1.4.0-py3-none-any.whl.metadata (3.7 kB)
15.00 Collecting attrs>=17.3.0 (from aiohttp<4.0.0,>=3.9.1->instructor>=1.0.0->commit-to-workflow==0.1.0)
15.05   Downloading attrs-26.1.0-py3-none-any.whl.metadata (8.8 kB)
15.34 Collecting frozenlist>=1.1.1 (from aiohttp<4.0.0,>=3.9.1->instructor>=1.0.0->commit-to-workflow==0.1.0)
15.40   Downloading frozenlist-1.8.0-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl.metadata (20 kB)
16.23 Collecting multidict<7.0,>=4.5 (from aiohttp<4.0.0,>=3.9.1->instructor>=1.0.0->commit-to-workflow==0.1.0)
16.29   Downloading multidict-6.7.1-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl.metadata (5.3 kB)
16.38 Collecting propcache>=0.2.0 (from aiohttp<4.0.0,>=3.9.1->instructor>=1.0.0->commit-to-workflow==0.1.0)
16.44   Downloading propcache-0.4.1-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl.metadata (13 kB)
17.15 Collecting yarl<2.0,>=1.17.0 (from aiohttp<4.0.0,>=3.9.1->instructor>=1.0.0->commit-to-workflow==0.1.0)
17.28   Downloading yarl-1.23.0-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl.metadata (79 kB)
17.87 Collecting MarkupSafe>=2.0 (from jinja2<4.0.0,>=3.1.4->instructor>=1.0.0->commit-to-workflow==0.1.0)
18.11   Downloading markupsafe-3.0.3-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl.metadata (2.7 kB)
18.29 Collecting jsonpatch<2.0.0,>=1.33.0 (from langchain-core<2,>=1.3.0->langgraph>=0.0.30->commit-to-workflow==0.1.0)
18.36   Downloading jsonpatch-1.33-py2.py3-none-any.whl.metadata (3.0 kB)
18.57 Collecting langchain-protocol>=0.0.10 (from langchain-core<2,>=1.3.0->langgraph>=0.0.30->commit-to-workflow==0.1.0)
18.62   Downloading langchain_protocol-0.0.14-py3-none-any.whl.metadata (2.4 kB)
18.84 Collecting langsmith<1.0.0,>=0.3.45 (from langchain-core<2,>=1.3.0->langgraph>=0.0.30->commit-to-workflow==0.1.0)
18.92   Downloading langsmith-0.7.38-py3-none-any.whl.metadata (15 kB)
19.05 Collecting packaging>=23.2.0 (from langchain-core<2,>=1.3.0->langgraph>=0.0.30->commit-to-workflow==0.1.0)
19.11   Downloading packaging-26.2-py3-none-any.whl.metadata (3.5 kB)
19.28 Collecting pyyaml<7.0.0,>=5.3.0 (from langchain-core<2,>=1.3.0->langgraph>=0.0.30->commit-to-workflow==0.1.0)
19.35   Downloading pyyaml-6.0.3-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl.metadata (2.4 kB)
19.67 Collecting uuid-utils<1.0,>=0.12.0 (from langchain-core<2,>=1.3.0->langgraph>=0.0.30->commit-to-workflow==0.1.0)
19.73   Downloading uuid_utils-0.14.1-cp39-abi3-manylinux_2_17_aarch64.manylinux2014_aarch64.whl.metadata (4.8 kB)
19.90 Collecting ormsgpack>=1.12.0 (from langgraph-checkpoint<5.0.0,>=2.1.0->langgraph>=0.0.30->commit-to-workflow==0.1.0)
19.96   Downloading ormsgpack-1.12.2-cp312-cp312-manylinux_2_17_aarch64.manylinux2014_aarch64.whl.metadata (3.2 kB)
20.03 Collecting httpx>=0.25.2 (from langgraph-sdk<0.4.0,>=0.3.0->langgraph>=0.0.30->commit-to-workflow==0.1.0)
20.09   Downloading httpx-0.28.1-py3-none-any.whl.metadata (7.1 kB)
20.66 Collecting orjson>=3.11.5 (from langgraph-sdk<0.4.0,>=0.3.0->langgraph>=0.0.30->commit-to-workflow==0.1.0)
20.74   Downloading orjson-3.11.8-cp312-cp312-manylinux_2_17_aarch64.manylinux2014_aarch64.whl.metadata (41 kB)
20.97 Collecting anyio<5,>=3.5.0 (from openai<3.0.0,>=2.0.0->instructor>=1.0.0->commit-to-workflow==0.1.0)
21.03   Downloading anyio-4.13.0-py3-none-any.whl.metadata (4.5 kB)
21.08 Collecting distro<2,>=1.7.0 (from openai<3.0.0,>=2.0.0->instructor>=1.0.0->commit-to-workflow==0.1.0)
21.13   Downloading distro-1.9.0-py3-none-any.whl.metadata (6.8 kB)
21.26 Collecting sniffio (from openai<3.0.0,>=2.0.0->instructor>=1.0.0->commit-to-workflow==0.1.0)
21.31   Downloading sniffio-1.3.1-py3-none-any.whl.metadata (3.9 kB)
21.47 Collecting tqdm>4 (from openai<3.0.0,>=2.0.0->instructor>=1.0.0->commit-to-workflow==0.1.0)
21.62   Downloading tqdm-4.67.3-py3-none-any.whl.metadata (57 kB)
22.12 Collecting charset_normalizer<4,>=2 (from requests<3.0.0,>=2.32.3->instructor>=1.0.0->commit-to-workflow==0.1.0)
22.17   Downloading charset_normalizer-3.4.7-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl.metadata (40 kB)
22.34 Collecting idna<4,>=2.5 (from requests<3.0.0,>=2.32.3->instructor>=1.0.0->commit-to-workflow==0.1.0)
22.39   Downloading idna-3.13-py3-none-any.whl.metadata (8.0 kB)
22.47 Collecting urllib3<3,>=1.26 (from requests<3.0.0,>=2.32.3->instructor>=1.0.0->commit-to-workflow==0.1.0)
22.52   Downloading urllib3-2.6.3-py3-none-any.whl.metadata (6.9 kB)
22.67 Collecting certifi>=2023.5.7 (from requests<3.0.0,>=2.32.3->instructor>=1.0.0->commit-to-workflow==0.1.0)
22.78   Downloading certifi-2026.4.22-py3-none-any.whl.metadata (2.5 kB)
22.89 Collecting markdown-it-py>=2.2.0 (from rich<15.0.0,>=13.7.0->instructor>=1.0.0->commit-to-workflow==0.1.0)
22.95   Downloading markdown_it_py-4.0.0-py3-none-any.whl.metadata (7.3 kB)
23.07 Collecting pygments<3.0.0,>=2.13.0 (from rich<15.0.0,>=13.7.0->instructor>=1.0.0->commit-to-workflow==0.1.0)
23.12   Downloading pygments-2.20.0-py3-none-any.whl.metadata (2.5 kB)
23.23 Collecting shellingham>=1.3.0 (from typer<1.0.0,>=0.9.0->instructor>=1.0.0->commit-to-workflow==0.1.0)
23.30   Downloading shellingham-1.5.4-py2.py3-none-any.whl.metadata (3.5 kB)
23.45 Collecting httpcore==1.* (from httpx>=0.25.2->langgraph-sdk<0.4.0,>=0.3.0->langgraph>=0.0.30->commit-to-workflow==0.1.0)
23.51   Downloading httpcore-1.0.9-py3-none-any.whl.metadata (21 kB)
23.65 Collecting jsonpointer>=1.9 (from jsonpatch<2.0.0,>=1.33.0->langchain-core<2,>=1.3.0->langgraph>=0.0.30->commit-to-workflow==0.1.0)
23.70   Downloading jsonpointer-3.1.1-py3-none-any.whl.metadata (2.4 kB)
23.79 Collecting requests-toolbelt>=1.0.0 (from langsmith<1.0.0,>=0.3.45->langchain-core<2,>=1.3.0->langgraph>=0.0.30->commit-to-workflow==0.1.0)
23.83   Downloading requests_toolbelt-1.0.0-py2.py3-none-any.whl.metadata (14 kB)
24.23 Collecting zstandard>=0.23.0 (from langsmith<1.0.0,>=0.3.45->langchain-core<2,>=1.3.0->langgraph>=0.0.30->commit-to-workflow==0.1.0)
24.30   Downloading zstandard-0.25.0-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.whl.metadata (3.3 kB)
24.37 Collecting mdurl~=0.1 (from markdown-it-py>=2.2.0->rich<15.0.0,>=13.7.0->instructor>=1.0.0->commit-to-workflow==0.1.0)
24.43   Downloading mdurl-0.1.2-py3-none-any.whl.metadata (1.6 kB)
24.54 Downloading fastapi-0.136.1-py3-none-any.whl (117 kB)
24.86 Downloading instructor-1.15.1-py3-none-any.whl (178 kB)
25.22 Downloading langgraph-1.1.10-py3-none-any.whl (173 kB)
25.47 Downloading pydantic-2.13.3-py3-none-any.whl (471 kB)
25.90 Downloading pydantic_core-2.46.3-cp312-cp312-manylinux_2_17_aarch64.manylinux2014_aarch64.whl (2.0 MB)
27.08    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2.0/2.0 MB 1.8 MB/s eta 0:00:00
27.16 Downloading ruff-0.15.12-py3-none-manylinux_2_17_aarch64.manylinux2014_aarch64.whl (10.8 MB)
30.59    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 10.8/10.8 MB 3.1 MB/s eta 0:00:00
30.65 Downloading temporalio-1.26.0-cp310-abi3-manylinux_2_17_aarch64.manylinux2014_aarch64.whl (13.8 MB)
34.64    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 13.8/13.8 MB 3.6 MB/s eta 0:00:00
34.70 Downloading nexus_rpc-1.4.0-py3-none-any.whl (29 kB)
34.88 Downloading tree_sitter-0.25.2-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl (607 kB)
35.14    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 607.1/607.1 kB 4.7 MB/s eta 0:00:00
35.20 Downloading uvicorn-0.46.0-py3-none-any.whl (70 kB)
35.26 Downloading aiohttp-3.13.5-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl (1.7 MB)
35.94    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.7/1.7 MB 2.4 MB/s eta 0:00:00
36.02 Downloading annotated_doc-0.0.4-py3-none-any.whl (5.3 kB)
36.09 Downloading annotated_types-0.7.0-py3-none-any.whl (13 kB)
36.16 Downloading click-8.3.3-py3-none-any.whl (110 kB)
36.26 Downloading docstring_parser-0.18.0-py3-none-any.whl (22 kB)
36.32 Downloading h11-0.16.0-py3-none-any.whl (37 kB)
36.38 Downloading jinja2-3.1.6-py3-none-any.whl (134 kB)
36.49 Downloading jiter-0.13.0-cp312-cp312-manylinux_2_17_aarch64.manylinux2014_aarch64.whl (348 kB)
45.78 Downloading langchain_core-1.3.2-py3-none-any.whl (542 kB)
46.31    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 542.4/542.4 kB 2.4 MB/s eta 0:00:00
46.38 Downloading langgraph_checkpoint-4.0.3-py3-none-any.whl (51 kB)
46.59 Downloading langgraph_prebuilt-1.0.12-py3-none-any.whl (37 kB)
46.72 Downloading langgraph_sdk-0.3.13-py3-none-any.whl (96 kB)
46.90 Downloading openai-2.33.0-py3-none-any.whl (1.2 MB)
47.60    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.2/1.2 MB 1.8 MB/s eta 0:00:00
47.66 Downloading protobuf-6.33.6-cp39-abi3-manylinux2014_aarch64.whl (324 kB)
47.92 Downloading requests-2.33.1-py3-none-any.whl (64 kB)
48.14 Downloading rich-14.3.4-py3-none-any.whl (310 kB)
48.33 Downloading starlette-1.0.0-py3-none-any.whl (72 kB)
48.58 Downloading tenacity-9.1.4-py3-none-any.whl (28 kB)
48.66 Downloading typer-0.25.0-py3-none-any.whl (55 kB)
48.78 Downloading types_protobuf-6.32.1.20260221-py3-none-any.whl (77 kB)
48.89 Downloading typing_extensions-4.15.0-py3-none-any.whl (44 kB)
48.99 Downloading typing_inspection-0.4.2-py3-none-any.whl (14 kB)
49.08 Downloading xxhash-3.7.0-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl (212 kB)
49.29 Downloading aiohappyeyeballs-2.6.1-py3-none-any.whl (15 kB)
49.36 Downloading aiosignal-1.4.0-py3-none-any.whl (7.5 kB)
49.43 Downloading anyio-4.13.0-py3-none-any.whl (114 kB)
49.58 Downloading attrs-26.1.0-py3-none-any.whl (67 kB)
49.68 Downloading certifi-2026.4.22-py3-none-any.whl (135 kB)
49.85 Downloading charset_normalizer-3.4.7-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl (208 kB)
50.04 Downloading distro-1.9.0-py3-none-any.whl (20 kB)
50.12 Downloading frozenlist-1.8.0-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl (243 kB)
50.49 Downloading httpx-0.28.1-py3-none-any.whl (73 kB)
50.68 Downloading httpcore-1.0.9-py3-none-any.whl (78 kB)
50.88 Downloading idna-3.13-py3-none-any.whl (68 kB)
51.08 Downloading jsonpatch-1.33-py2.py3-none-any.whl (12 kB)
51.14 Downloading langchain_protocol-0.0.14-py3-none-any.whl (7.0 kB)
51.21 Downloading langsmith-0.7.38-py3-none-any.whl (392 kB)
51.58 Downloading markdown_it_py-4.0.0-py3-none-any.whl (87 kB)
51.70 Downloading markupsafe-3.0.3-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl (24 kB)
51.76 Downloading multidict-6.7.1-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl (258 kB)
51.96 Downloading orjson-3.11.8-cp312-cp312-manylinux_2_17_aarch64.manylinux2014_aarch64.whl (131 kB)
52.27 Downloading ormsgpack-1.12.2-cp312-cp312-manylinux_2_17_aarch64.manylinux2014_aarch64.whl (203 kB)
52.43 Downloading packaging-26.2-py3-none-any.whl (100 kB)
52.54 Downloading propcache-0.4.1-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl (225 kB)
53.04 Downloading pygments-2.20.0-py3-none-any.whl (1.2 MB)
54.78    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.2/1.2 MB 973.9 kB/s eta 0:00:00
54.84 Downloading pyyaml-6.0.3-cp312-cp312-manylinux2014_aarch64.manylinux_2_17_aarch64.manylinux_2_28_aarch64.whl (775 kB)
69.86                                             0.0/775.1 kB ? eta -:--:--
74.92 ERROR: Exception:
74.92 Traceback (most recent call last):
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_vendor/urllib3/response.py", line 438, in _error_catcher
74.92     yield
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_vendor/urllib3/response.py", line 561, in read
74.92     data = self._fp_read(amt) if not fp_closed else b""
74.92            ^^^^^^^^^^^^^^^^^^
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_vendor/urllib3/response.py", line 527, in _fp_read
74.92     return self._fp.read(amt) if amt is not None else self._fp.read()
74.92            ^^^^^^^^^^^^^^^^^^
74.92   File "/usr/local/lib/python3.12/http/client.py", line 484, in read
74.92     s = self.fp.read(amt)
74.92         ^^^^^^^^^^^^^^^^^
74.92   File "/usr/local/lib/python3.12/socket.py", line 720, in readinto
74.92     return self._sock.recv_into(b)
74.92            ^^^^^^^^^^^^^^^^^^^^^^^
74.92   File "/usr/local/lib/python3.12/ssl.py", line 1251, in recv_into
74.92     return self.read(nbytes, buffer)
74.92            ^^^^^^^^^^^^^^^^^^^^^^^^^
74.92   File "/usr/local/lib/python3.12/ssl.py", line 1103, in read
74.92     return self._sslobj.read(len, buffer)
74.92            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
74.92 TimeoutError: The read operation timed out
74.92 
74.92 During handling of the above exception, another exception occurred:
74.92 
74.92 Traceback (most recent call last):
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_internal/cli/base_command.py", line 106, in _run_wrapper
74.92     status = _inner_run()
74.92              ^^^^^^^^^^^^
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_internal/cli/base_command.py", line 97, in _inner_run
74.92     return self.run(options, args)
74.92            ^^^^^^^^^^^^^^^^^^^^^^^
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_internal/cli/req_command.py", line 67, in wrapper
74.92     return func(self, options, args)
74.92            ^^^^^^^^^^^^^^^^^^^^^^^^^
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_internal/commands/install.py", line 386, in run
74.92     requirement_set = resolver.resolve(
74.92                       ^^^^^^^^^^^^^^^^^
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_internal/resolution/resolvelib/resolver.py", line 179, in resolve
74.92     self.factory.preparer.prepare_linked_requirements_more(reqs)
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_internal/operations/prepare.py", line 554, in prepare_linked_requirements_more
74.92     self._complete_partial_requirements(
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_internal/operations/prepare.py", line 469, in _complete_partial_requirements
74.92     for link, (filepath, _) in batch_download:
74.92                                ^^^^^^^^^^^^^^
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_internal/network/download.py", line 184, in __call__
74.92     for chunk in chunks:
74.92                  ^^^^^^
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_internal/cli/progress_bars.py", line 55, in _rich_progress_bar
74.92     for chunk in iterable:
74.92                  ^^^^^^^^
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_internal/network/utils.py", line 65, in response_chunks
74.92     for chunk in response.raw.stream(
74.92                  ^^^^^^^^^^^^^^^^^^^^
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_vendor/urllib3/response.py", line 622, in stream
74.92     data = self.read(amt=amt, decode_content=decode_content)
74.92            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_vendor/urllib3/response.py", line 560, in read
74.92     with self._error_catcher():
74.92          ^^^^^^^^^^^^^^^^^^^^^
74.92   File "/usr/local/lib/python3.12/contextlib.py", line 158, in __exit__
74.92     self.gen.throw(value)
74.92   File "/usr/local/lib/python3.12/site-packages/pip/_vendor/urllib3/response.py", line 443, in _error_catcher
74.92     raise ReadTimeoutError(self._pool, None, "Read timed out.")
74.92 pip._vendor.urllib3.exceptions.ReadTimeoutError: HTTPSConnectionPool(host='files.pythonhosted.org', port=443): Read timed out.
------
[+] up 0/2
 ⠙ Image commit-to-workflow-backend   Building                                                                                                                                                                                                                          412.9s
 ⠙ Image commit-to-workflow-dashboard Building                                                                                                                                                                                                                          412.9s
Dockerfile:17

--------------------

  15 |     

  16 |     # Install dependencies

  17 | >>> RUN pip install --no-cache-dir .

  18 |     

  19 |     # Expose FastAPI port

--------------------

target backend: failed to solve: process "/bin/sh -c pip install --no-cache-dir ." did not complete successfully: exit code: 2



View build details: docker-desktop://dashboard/build/default/default/uas91uvge5rmvrbghppgj9h4b

anujkumar.gupta@CLV-MVHLJ2FKQL commit-to-workflow % 
