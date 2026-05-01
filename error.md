kend-1  | Completing activity as failed ({'activity_id': '1', 'activity_type': 'parse_repository_file', 'attempt': 19, 'namespace': 'default', 'task_queue': 'analysis-tasks', 'workflow_id': 'analysis-HEAD-1777580502', 'workflow_run_id': 'd4bed895-5abe-4a88-9341-e186de6f9eb8', 'workflow_type': 'RepositoryAnalysisWorkflow'})
backend-1  | Traceback (most recent call last):
backend-1  |   File "/app/src/engine/parser.py", line 76, in extract_structure
backend-1  |     captures = query.captures(tree.root_node)
backend-1  |                ^^^^^^^^^^^^^^
backend-1  | AttributeError: 'tree_sitter.Query' object has no attribute 'captures'
backend-1  | 
backend-1  | During handling of the above exception, another exception occurred:
backend-1  | 
backend-1  | Traceback (most recent call last):
backend-1  |   File "/app/src/workflows/activities.py", line 25, in parse_repository_file
backend-1  |     structure = parser.extract_structure(tree, lang)
backend-1  |                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
backend-1  |   File "/app/src/engine/parser.py", line 86, in extract_structure
backend-1  |     matches = query.matches(tree.root_node)
backend-1  |               ^^^^^^^^^^^^^
backend-1  | AttributeError: 'tree_sitter.Query' object has no attribute 'matches'
backend-1  | 
backend-1  | During handling of the above exception, another exception occurred:
backend-1  | 
backend-1  | Traceback (most recent call last):
backend-1  |   File "/usr/local/lib/python3.12/site-packages/temporalio/worker/_activity.py", line 359, in _handle_start_activity_task
backend-1  |     result = await self._execute_activity(
backend-1  |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
backend-1  |   File "/usr/local/lib/python3.12/site-packages/temporalio/worker/_activity.py", line 714, in _execute_activity
backend-1  |     return await impl.execute_activity(input)
backend-1  |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
backend-1  |   File "/usr/local/lib/python3.12/site-packages/temporalio/worker/_activity.py", line 909, in execute_activity
backend-1  |     return await input.fn(*input.args)
backend-1  |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^
backend-1  |   File "/app/src/workflows/activities.py", line 28, in parse_repository_file
backend-1  |     raise Exception(f"Failed to parse {file_path}: {str(e)}")
backend-1  | Exception: Failed to parse src/main.py: 'tree_sitter.Query' object has no attribute 'matches'
backend-1  | Completing activity as failed ({'activity_id': '1', 'activity_type': 'parse_repository_file', 'attempt': 19, 'namespace': 'default', 'task_queue': 'analysis-tasks', 'workflow_id': 'analysis-HEAD-1777580508', 'workflow_run_id': '6f3d51a1-6f9a-4c3a-a5f1-c8973a6f53cc', 'workflow_type': 'RepositoryAnalysisWorkflow'})
backend-1  | Traceback (most recent call last):
backend-1  |   File "/app/src/engine/parser.py", line 76, in extract_structure
backend-1  |     captures = query.captures(tree.root_node)
backend-1  |                ^^^^^^^^^^^^^^
backend-1  | AttributeError: 'tree_sitter.Query' object has no attribute 'captures'
backend-1  | 
backend-1  | During handling of the above exception, another exception occurred:
backend-1  | 
backend-1  | Traceback (most recent call last):
backend-1  |   File "/app/src/workflows/activities.py", line 25, in parse_repository_file
backend-1  |     structure = parser.extract_structure(tree, lang)
backend-1  |                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
backend-1  |   File "/app/src/engine/parser.py", line 86, in extract_structure
backend-1  |     matches = query.matches(tree.root_node)
backend-1  |               ^^^^^^^^^^^^^
backend-1  | AttributeError: 'tree_sitter.Query' object has no attribute 'matches'
backend-1  | 
backend-1  | During handling of the above exception, another exception occurred:
backend-1  | 
backend-1  | Traceback (most recent call last):
backend-1  |   File "/usr/local/lib/python3.12/site-packages/temporalio/worker/_activity.py", line 359, in _handle_start_activity_task
backend-1  |     result = await self._execute_activity(
backend-1  |              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
backend-1  |   File "/usr/local/lib/python3.12/site-packages/temporalio/worker/_activity.py", line 714, in _execute_activity
backend-1  |     return await impl.execute_activity(input)
backend-1  |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
backend-1  |   File "/usr/local/lib/python3.12/site-packages/temporalio/worker/_activity.py", line 909, in execute_activity
backend-1  |     return await input.fn(*input.args)
backend-1  |            ^^^^^^^^^^^^^^^^^^^^^^^^^^^
backend-1  |   File "/app/src/workflows/activities.py", line 28, in parse_repository_file
backend-1  |     raise Exception(f"Failed to parse {file_path}: {str(e)}")
backend-1  | Exception: Failed to parse src/main.py: 'tree_sitter.Query' object has no attribute 'matches'

