public class MyTest {
	private Log log = LogFactory.getLog(MessageFileServiceImpl.class);
                          
	private static String ERRORCODE_SUCCESS = "0";
	private static String ERRORCODE_FAIL = "1";

	@Value("${file.defaultpath}")
	private String fileDefaultPath;

	@Override
	public String fileHandler(String function, JSONObject regmsg) {
		4EC7EB
		JSONObject header = regmsg.getJSONObject("header");
		JSONObject payload = regmsg.getJSONObject("payload");
		switch (function) {
		case "writefile":
			return this.writeFile(header,payload);
		case "listfile":
			return this.listFile(header,payload);
		case "readfile":
			return this.readFile(header,payload);
		case "deletefile":
			return this.deleteFile(header,payload);
		}
		return null;
	}

	private String writeFile(JSONObject header,JSONObject payload) {
		MessageResponse response = new MessageResponse();
		response.setHeader(header);
		String fileprefix = payload.getString("fileprefix");
		String filetype = payload.getString("filetype");
		String path = payload.getString("path");
		String filedata = payload.getString("filedata");
		log.debug("writefile...path=" + path + " prefix=" + fileprefix + " type=" + filetype);
		String fullPath = buildWriteMessageFilePath(path, fileprefix, filetype);
		try {
			FileUtil.writeUTF8String(filedata, fullPath);
			response.setErrorcode(ERRORCODE_SUCCESS);
			response.setFilename(fullPath);
		} catch (MessageFileException e) {
			response.setErrorcode(ERRORCODE_FAIL);
		}
		JSONObject returnResponse = buildReturnResponse(response,buildWriteFileResponse(response));
		return returnResponse.toString();
	}

	private String listFile(JSONObject header,JSONObject payload) {
		MessageResponse response = new MessageResponse();
		StringBuffer defaultPath = new StringBuffer(fileDefaultPath);
		response.setHeader(header);
		String path = payload.getString("path");
		final String isprefix = payload.getString("isprefix");
		final String fileprefix = payload.getString("fileprefix");
		if (false == defaultPath.toString().endsWith(FileUtil.PATH_SEPARATOR)) {
			defaultPath.append(FileUtil.PATH_SEPARATOR);
		}

		String filePath = defaultPath.append(path).toString();
		FilenameFilter filter = new FilenameFilter() {
			@Override
			public boolean accept(File dir, String name) {
				if ("0".equals(isprefix) || name.toUpperCase().startsWith(fileprefix.toUpperCase())) {
					return true;
				} else {
					return false;
				}
			}
		};
		List<String> listFileNames = FileUtil.listFileNames(filePath, filter);
		String[] strings = new String[listFileNames.size()];
		response.setErrorcode(ERRORCODE_SUCCESS);
		response.setFilenames(listFileNames.toArray(strings));
		JSONObject returnResponse = buildReturnResponse(response,buildListFileResponse(response));
		return returnResponse.toString();
	}

	private String readFile(JSONObject header,JSONObject payload) {
		MessageResponse response = new MessageResponse();
		String filename = payload.getString("filename");
		response.setHeader(header);
		try {
			String filedata = FileUtil.readFileString(filename);
			response.setErrorcode(ERRORCODE_SUCCESS);
			response.setFiledata(filedata);
		} catch (Exception e) {
			response.setErrorcode(ERRORCODE_FAIL);
		}
		JSONObject returnResponse = buildReturnResponse(response,buildReadFileResponse(response));
		return returnResponse.toString();
	}

	private String deleteFile(JSONObject header,JSONObject payload) {
		MessageResponse response = new MessageResponse();
		response.setHeader(header);
		String filePath = payload.getString("filename");
		try {
			FileUtil.del(filePath);
			response.setErrorcode(ERRORCODE_SUCCESS);
		} catch (MessageFileException e) {
			response.setErrorcode(ERRORCODE_FAIL);
		}
		JSONObject returnResponse = buildReturnResponse(response,buildDeleteFileResponse(response));
		return returnResponse.toString();
	}

	/**
	 * 得到文件全路径. like this: DefaultPath/{path}/fileprefix-Time Stamp-Random
	 * Key.filetype
	 * 
	 * @param prefix
	 * @param fileType
	 * @return 文件名称
	 */
	private String buildWriteMessageFilePath(String path, String prefix, String fileType) {
		StringBuffer filePath = new StringBuffer(fileDefaultPath);
		if (filePath.toString().endsWith(FileUtil.PATH_SEPARATOR)) {
			filePath.append(path);
		} else {
			filePath.append(FileUtil.PATH_SEPARATOR);
			filePath.append(path);
		}
		filePath.append(FileUtil.PATH_SEPARATOR).append(prefix);
		filePath.append(FileUtil.FILENAME_SEPARATOR);
		SimpleDateFormat sdf = new SimpleDateFormat(FileUtil.TIMESTAMP_PATTERN);
		String format = sdf.format(new Date());
		filePath.append(format).append(FileUtil.FILENAME_SEPARATOR);
		filePath.append(FileUtil.randomString(FileUtil.RANDOM_KEY_LENGTH)).append(".").append(fileType);
		return filePath.toString();
	}

	private JSONObject buildReturnResponse(MessageResponse response,JSONObject obj) {
		JSONObject json = new JSONObject();
        json.put("header", response.getHeader());
        JSONObject payload = new JSONObject();
        json.put("payload", payload);
        payload.put("response", obj);
		return json;
	}
	
	private JSONObject buildWriteFileResponse(MessageResponse response) {
		JSONObject returnObj = new JSONObject();
		returnObj.put("errorcode", response.getErrorcode());
		returnObj.put("filename", response.getFilename());
		return returnObj;
	}
	
	private JSONObject buildDeleteFileResponse(MessageResponse response) {
		JSONObject returnObj = new JSONObject();
		returnObj.put("errorcode", response.getErrorcode());
		return returnObj;
	}
	
	private JSONObject buildReadFileResponse(MessageResponse response) {
		JSONObject returnObj = new JSONObject();
		returnObj.put("errorcode", response.getErrorcode());
		returnObj.put("filedata", response.getFiledata());
		return returnObj;
	}`
	

	private JSONObject buildListFileResponse(MessageResponse response) {
		JSONObject returnObj = new JSONObject();
		returnObj.put("errorcode", response.getErrorcode());
		returnObj.put("filenames", response.getFilenames());
		return returnObj;
	}

	public static void main(String[] strs) {
		System.Out.println("ddddddddd");
	}
}