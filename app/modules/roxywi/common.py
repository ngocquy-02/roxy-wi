import os
import cgi
import glob
import http.cookies

import distro

import modules.db.sql as sql
import modules.common.common as common
import modules.roxy_wi_tools as roxy_wi_tools

time_zone = sql.get_setting('time_zone')
get_date = roxy_wi_tools.GetDate(time_zone)
get_config_var = roxy_wi_tools.GetConfigVar()
form = common.form
serv = common.is_ip_or_dns(form.getvalue('serv'))


def return_error_message():
	return 'error: All fields must be completed'


def get_user_group(**kwargs) -> str:
	user_group = ''

	try:
		cookie = http.cookies.SimpleCookie(os.environ.get("HTTP_COOKIE"))
		user_group_id = cookie.get('group')
		user_group_id1 = user_group_id.value
		groups = sql.select_groups(id=user_group_id1)
		for g in groups:
			if g.group_id == int(user_group_id1):
				if kwargs.get('id'):
					user_group = g.group_id
				else:
					user_group = g.name
	except Exception:
		check_user_group()

	return user_group


def check_user_group(**kwargs):
	if kwargs.get('token') is not None:
		return True

	if kwargs.get('user_uuid'):
		group_id = kwargs.get('user_group_id')
		user_uuid = kwargs.get('user_uuid')
		user_id = sql.get_user_id_by_uuid(user_uuid)
	else:
		cookie = http.cookies.SimpleCookie(os.environ.get("HTTP_COOKIE"))
		user_uuid = cookie.get('uuid')
		group = cookie.get('group')
		group_id = group.value
		user_id = sql.get_user_id_by_uuid(user_uuid.value)

	if sql.check_user_group(user_id, group_id):
		return True
	else:
		logging('Roxy-WI server', ' has tried to actions in not his group ', roxywi=1, login=1)
		try:
			ref = os.environ.get("REQUEST_URI").split('&')[0]
		except Exception:
			ref = os.environ.get("REQUEST_URI")
		ref = common.checkAjaxInput(ref)
		print(f'<meta http-equiv="refresh" content="0; url={ref}">')
		return False


def get_user_id(**kwargs):
	if kwargs.get('login'):
		return sql.get_user_id_by_username(kwargs.get('login'))

	cookie = http.cookies.SimpleCookie(os.environ.get("HTTP_COOKIE"))
	user_uuid = cookie.get('uuid')

	if user_uuid is not None:
		user_id = sql.get_user_id_by_uuid(user_uuid.value)

		return user_id


def check_is_server_in_group(server_ip: str) -> bool:
	group_id = get_user_group(id=1)
	servers = sql.select_servers(server=server_ip)
	for s in servers:
		if (s[2] == server_ip and int(s[3]) == int(group_id)) or group_id == 1:
			return True
		else:
			logging('Roxy-WI server', ' has tried to actions in not his group server ', roxywi=1, login=1)
			try:
				ref = os.environ.get("REQUEST_URI").split('&')[0]
			except Exception:
				ref = os.environ.get("REQUEST_URI")
			ref = common.checkAjaxInput(ref)
			print(f'<meta http-equiv="refresh" content="0; url={ref}">')
			return False


def get_files(folder=None, file_format='cfg') -> list:
	if folder is None:
		folder = get_config_var.get_config_var('configs', 'haproxy_save_configs_dir')
	if file_format == 'log':
		file = []
	else:
		file = set()
	return_files = set()
	i = 0
	for files in sorted(glob.glob(os.path.join(folder, f'*.{file_format}*'))):
		if file_format == 'log':
			try:
				file += [(i, files.split('/')[4])]
			except Exception as e:
				print(e)
		else:
			file.add(files.split('/')[-1])
		i += 1
	files = file
	if file_format == 'cfg' or file_format == 'conf':
		for file in files:
			ip = file.split("-")
			if serv == ip[0]:
				return_files.add(file)
		return sorted(return_files, reverse=True)
	else:
		return file


def logging(server_ip: str, action: str, **kwargs) -> None:
	login = ''
	cur_date = get_date.return_date('logs')
	cur_date_in_log = get_date.return_date('date_in_log')
	log_path = get_config_var.get_config_var('main', 'log_path')

	if not os.path.exists(log_path):
		os.makedirs(log_path)

	try:
		user_group = get_user_group()
	except Exception:
		user_group = ''

	try:
		ip = cgi.escape(os.environ["REMOTE_ADDR"])
	except Exception:
		ip = ''

	try:
		cookie = http.cookies.SimpleCookie(os.environ.get("HTTP_COOKIE"))
		user_uuid = cookie.get('uuid')
		login = sql.get_user_name_by_uuid(user_uuid.value)
	except Exception:
		login_name = kwargs.get('login')
		try:
			if len(login_name) > 1:
				login = kwargs.get('login')
		except Exception:
			login = ''

	try:
		if distro.id() == 'ubuntu':
			os.system('sudo chown www-data:www-data -R ' + log_path)
		else:
			os.system('sudo chown apache:apache -R ' + log_path)
	except Exception:
		pass

	if kwargs.get('roxywi') == 1:
		if kwargs.get('login'):
			mess = f"{cur_date_in_log} from {ip} user: {login}, group: {user_group}, {action} on: {server_ip}\n"
			if kwargs.get('keep_history'):
				try:
					keep_action_history(kwargs.get('service'), action, server_ip, login, ip)
				except Exception as e:
					print(str(e))
		else:
			mess = f"{cur_date_in_log} {action} from {ip}\n"
		log_file = f"{log_path}/roxy-wi-{cur_date}.log"
	elif kwargs.get('provisioning') == 1:
		mess = f"{cur_date_in_log} from {ip} user: {login}, group: {user_group}, {action}\n"
		log_file = f"{log_path}/provisioning-{cur_date}.log"
	else:
		mess = f"{cur_date_in_log} from {ip} user: {login}, group: {user_group}, {action} on: {server_ip}\n"
		log_file = f"{log_path}/config_edit-{cur_date}.log"

		if kwargs.get('keep_history'):
			try:
				keep_action_history(kwargs.get('service'), action, server_ip, login, ip)
			except Exception:
				pass

	try:
		with open(log_file, 'a') as log:
			log.write(mess)
	except IOError as e:
		print(f'<center><div class="alert alert-danger">Cannot write log. Please check log_path in config {e}</div></center>')


def keep_action_history(service: str, action: str, server_ip: str, login: str, user_ip: str):
	try:
		server_id = sql.select_server_id_by_ip(server_ip=server_ip)
		hostname = sql.get_hostname_by_server_ip(server_ip)
		if login != '':
			user_id = sql.get_user_id_by_username(login)
		else:
			user_id = 0
		if user_ip == '':
			user_ip = 'localhost'

		sql.insert_action_history(service, action, server_id, user_id, user_ip, server_ip, hostname)
	except Exception as e:
		logging('Roxy-WI server', f'Cannot save a history: {e}', roxywi=1)


def get_dick_permit(**kwargs):
	if kwargs.get('token'):
		token = kwargs.get('token')
	else:
		token = ''

	if check_user_group(token=token):
		try:
			servers = sql.get_dick_permit(**kwargs)
		except Exception as e:
			raise Exception(e)
		else:
			return servers
	else:
		print('Atata!')


def get_users_params(**kwargs):
	cookie = http.cookies.SimpleCookie(os.environ.get("HTTP_COOKIE"))

	try:
		user_uuid = cookie.get('uuid')
		user = sql.get_user_name_by_uuid(user_uuid.value)
	except Exception:
		print('<meta http-equiv="refresh" content="0; url=/app/login.py">')
		return

	try:
		group_id = cookie.get('group')
		group_id = int(group_id.value)
	except Exception:
		print('<meta http-equiv="refresh" content="0; url=/app/login.py">')
		return

	try:
		role = sql.get_user_role_by_uuid(user_uuid.value, group_id)
	except Exception:
		print('<meta http-equiv="refresh" content="0; url=/app/login.py">')
		return
	try:
		user_id = sql.get_user_id_by_uuid(user_uuid.value)
		user_services = sql.select_user_services(user_id)
		token = sql.get_token(user_uuid.value)
	except Exception:
		print('<meta http-equiv="refresh" content="0; url=/app/login.py">')
		return

	if kwargs.get('virt') and kwargs.get('haproxy'):
		servers = get_dick_permit(virt=1, haproxy=1)
	elif kwargs.get('virt'):
		servers = get_dick_permit(virt=1)
	elif kwargs.get('disable'):
		servers = get_dick_permit(disable=0)
	elif kwargs.get('haproxy'):
		servers = get_dick_permit(haproxy=1)
	elif kwargs.get('service'):
		servers = get_dick_permit(service=kwargs.get('service'))
	else:
		servers = get_dick_permit()

	user_lang = get_user_lang()

	user_params = {
		'user': user,
		'user_uuid': user_uuid,
		'role': role,
		'token': token,
		'servers': servers,
		'user_services': user_services,
		'lang': user_lang
	}

	return user_params


def get_user_lang() -> str:
	cookie = http.cookies.SimpleCookie(os.environ.get("HTTP_COOKIE"))

	try:
		user_lang = cookie.get('lang')
		user_lang = user_lang.value
	except Exception:
		return 'en'

	return user_lang


def return_user_status() -> dict:
	user_subscription = {}
	user_subscription.setdefault('user_status', sql.select_user_status())
	user_subscription.setdefault('user_plan', sql.select_user_plan())

	return user_subscription


def return_unsubscribed_user_status() -> dict:
	user_subscription = {'user_status': 0, 'user_plan': 0}

	return user_subscription
