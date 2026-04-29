/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2021, Seven Du <dujinfang@x-y-t.cn>
 *
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is XUI - GUI for FreeSWITCH
 *
 * The Initial Developer of the Original Code is
 * Seven Du <dujinfang@x-y-t.cn>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Seven Du <dujinfang@x-y-t.cn>
 *
 *
 */

"use strict";
import React, { useState, useEffect, memo } from "react";
import T from "i18n-react";
import { Link, NavLink } from "react-router-dom";
import {
  Permission_List,
  judgeUselessParam,
  getQueryParam,
  Globals,
  is_webrtc_supported,
} from "_libs/xglobals";
import {
  EditControl,
  xFetchJSON,
  DateRange,
  XytCard,
  Pagination,
  XAudio,
  formatSizeUnits,
  getFileExt,
} from "_libs/xtools";
import { ModalForm } from "_libs/xForm";
import verto from "@xswitch/rtc";
import moment from "moment";
import { VList } from "virtual-table-ant-design";
import AudioPlayerFetch from "../AudioPlayerFetch";
import "./page_media_files.less";

import {
  DeleteOutlined,
  DownloadOutlined,
  PhoneFilled,
  PlusOutlined,
  StopOutlined,
  CloudUploadOutlined,
  SearchOutlined,
  CloseOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import {
  Modal,
  Button,
  Progress,
  Checkbox,
  Table,
  Row,
  Col,
  Alert,
  message,
  Space,
  Form,
  Input,
  Divider,
  Breadcrumb,
  Switch,
  Select,
  Tooltip,
} from "antd";
import JSZip from "jszip";
import JSZipUtils from "jszip-utils";
import saveAs from "jszip/vendor/FileSaver.js";
import Dropzone from "react-dropzone";
import { nodeRegistries } from "../callflow/nodes";
const ButtonGroup = Button.Group;
const { confirm } = Modal;
const dateFormat = "YYYY-MM-DD";

// 自定义类别
const NewCustom = (props) => {
  const [list, setList] = useState([]);
  const [show_input, set_show_input] = useState(false);
  const [name, set_name] = useState(""); // 新增自定义类别名称
  // const [form] = Form.useForm();

  useEffect(() => {
    let isMounted = true;
    if (props.open) {
      getData();
    }
    return () => {
      isMounted = false;
    };
  }, [props.open]);

  const getData = () => {
    xFetchJSON("/api/dicts?realm=MFILE_TYPE", {
      method: "GET",
    })
      .then((result) => {
        setList(result);
        // form.setFieldsValue({
        // 	customs: result
        // });
      })
      .catch((msg) => {
        console.error(msg);
      });
  };

  // const onFieldsChange = () => {
  // 	console.log(changedValues, allValues);
  // };

  const handleSubmit = () => {
    console.log("handleSubmit", show_input, name);
    let body = {
      realm: "MFILE_TYPE",
      k: name,
      v: name,
    };
    console.log(body);

    if (show_input && name !== "") {
      xFetchJSON(`api/dicts`, {
        method: "POST",
        body: JSON.stringify(body),
      })
        .then((res) => {
          console.log(res);
          if (res?.code === 200) {
            message.success(T.translate("Submit Successfully"));
            set_show_input(false);
            set_name("");
            props.onHide();
          } else {
            message.info(res?.message);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          props.getFileType();
        });
    } else if (show_input && name === "") {
      message.info(T.translate("Please input name!"));
    } else {
      props.onHide();
    }

    // if (!form) return;
    // form.submit();
  };

  // const onFinish = (values) => {
  // 	const customs = values?.customs.map(item => ({
  // 		realm: 'MFILE_TYPE',
  // 		k: item.k,
  // 		v: item.k,
  // 	}));
  // 	console.log(customs);
  // 	xFetchJSON("/api/dicts/import", {
  // 		method: "POST",
  // 		body: JSON.stringify(customs)
  // 	}).then((res) => {
  // 		console.log(res, 'res');
  // 		props.onHide();
  // 	}).catch((msg) => {
  // 		message.error(`error: ${msg}`);
  // 	});
  // }

  const handleShowInput = () => {
    console.log("show");
    set_show_input(true);
  };

  const handleNameChanged = (e) => {
    console.log(e.target.value);
    set_name(e.target.value);
  };

  const handleDelete = (item) => {
    let _this = this;
    console.log(item, item.v, item.id);

    confirm({
      title: T.translate("Delete Custom Type"),
      content: T.translate("Confirm to Delete ?"),
      cancelText: T.translate("Cancel"),
      okText: T.translate("OK"),
      okType: "danger",
      onOk() {
        xFetchJSON("api/dicts/" + item.id, {
          method: "DELETE",
        })
          .then((res) => {
            console.log("res", res);
            if (res?.code === 200) {
              message.success(T.translate("Delete Successfully"));
            } else {
              message.error(`${T.translate("Delete Error")}: ${res?.message || res?.text || res}`);
            }
          })
          .catch((err) => {
            message.error(`${T.translate("Delete Error")}: ${err?.message || err?.text || err}`);
          })
          .finally(() => {
            getData();
            props.getFileType();
          });
      },
      onCancel() {},
    });
  };

  const listItems = list.map((item) => (
    <div key={item.id} className="media-files-new-custom-modal-list-item">
      <div>{item.k}</div>
      <Button type="link" onClick={() => handleDelete(item)}>
        {T.translate("Delete")}
      </Button>
    </div>
  ));

  return (
    <Modal
      {...props}
      centered
      className="media-files-new-custom-modal"
      title={T.translate("Custom")}
      okText={T.translate("Submit")}
      cancelText={T.translate("Close")}
      onOk={handleSubmit}
      onCancel={props.onHide}
    >
      <div className="media-files-new-custom-modal-list">
        <div> {listItems} </div>
        {!show_input ? (
          <Button
            block
            type="dashed"
            onClick={() => handleShowInput()}
            style={{ margin: "20px 0" }}
          >
            {T.translate("Add")}
          </Button>
        ) : (
          <Input
            placeholder={T.translate("name")}
            style={{ margin: "20px 0" }}
            onInput={(e) => handleNameChanged(e)}
          />
        )}
      </div>
      {/* <Alert
				message={T.translate("The maximum number of user-defined types is 5")}
				type="info"
				showIcon
			/> */}
      {/* <Form
				form={form}
				style={{ marginTop: 24 }}
				onFinish={onFinish}
				onValuesChange={onFieldsChange}
			>
				<Form.List name='customs'>
					{(fields, { add, remove }) => {
						return (
							<>
								{fields.map((field) => (
									<Row key={field.key} >
										<Col span={23}>
											<Form.Item
												{...field}
												name={[field.name, 'k']}
												fieldKey={[field.fieldKey, 'k']}
												rules={[{
													required: true,
													message: T.translate("is required")
												}]}
												wrapperCol={{ span: 23 }}
											>
												<EditControl style={{ with: '100%' }} />
											</Form.Item>
										</Col>

										<Col span={1} >
											<DeleteOutlined onClick={() => {
												// if (forAllvalus[listName]?.[field.name]?.id) {
												// 	var c = confirm(T.translate("Confirm to Delete ?"));
												// 	if (!c) return;
												// 	const id = forAllvalus[listName]?.[field.name]?.id
												// 	if (clickDelete === 'time_recurrence') {
												// 		xFetchJSON("/api/time_recurrence/templates/time_recurrences/" + id, {
												// 			method: "DELETE",
												// 		}).then((obj) => {
												// 			console.log(obj, 'obj///');
												// 		}).catch((msg) => {
												// 			console.error("route", msg);
												// 		});
												// 	} else {
												// 		xFetchJSON("/api/time_recurrence/" + id, {
												// 			method: "DELETE",
												// 		}).then((obj) => {
												// 			console.log(obj, 'obj///');
												// 		}).catch((msg) => {
												// 			console.error("route", msg);
												// 		});
												// 	}
												// }
												remove(field.name);
											}} style={{ marginTop: 8 }} />
										</Col>
									</Row>
								))}
								{fields.length < 5 && (
									<Form.Item wrapperCol={{ span: 22 }} style={{ marginTop: 12 }}>
										<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
											{T.translate('Add Custom Type')}
										</Button>
									</Form.Item>
								)}
							</>
						)
					}}
				</Form.List>
			</Form> */}
    </Modal>
  );
};

class NewMediaFile extends React.Component {
  constructor(props) {
    super(props);
  }

  handleSubmit = (text) => {
    console.log(text);
    if (text.engine == "baidu") {
      {
        xFetchJSON("/api/baidu/tts", {
          method: "POST",
          body: JSON.stringify(text),
        })
          .then((obj) => {
            this.props.handleNewMediaFileAdded(obj);
            this.props.onHide();
          })
          .catch((msg) => {
            message.error(`${T.translate("Create Failed")}: ${msg?.message || msg?.text || msg}`);
            this.props.onHide();
          });
      }
    }
    if (text.engine == "huawei") {
      {
        xFetchJSON("/api/huawei/tts", {
          method: "POST",
          body: JSON.stringify(text),
        })
          .then((obj) => {
            this.props.handleNewMediaFileAdded(obj);
            this.props.onHide();
          })
          .catch((msg) => {
            message.error(`${T.translate("Create Failed")}: ${msg?.message || msg?.text || msg}`);
            this.props.onHide();
          });
      }
    }
    if (text.engine == "ali") {
      {
        xFetchJSON("/api/ali/tts", {
          method: "POST",
          body: JSON.stringify(text),
        })
          .then((obj) => {
            this.props.handleNewMediaFileAdded(obj);
            this.props.onHide();
          })
          .catch((msg) => {
            message.error(`${T.translate("Create Failed")}: ${msg?.message || msg?.text || msg}`);
            this.props.onHide();
          });
      }
    }
  };

  render() {
    const props = Object.assign({}, this.props);
    delete props.handleNewMediaFileAdded;
    const formItems = [
      {
        label: T.translate("TTS Engine"),
        name: "engine",
        required: true,
        component: (
          <Select placeholder="engine" type="select">
            <Select.Option value="ali">{T.translate("ali")}</Select.Option>
            <Select.Option value="baidu">{T.translate("baidu")}</Select.Option>
            <Select.Option value="huawei">{T.translate("huawei")}</Select.Option>
            {/* <Select.Option value="xunfei" >{T.translate('xunfei')}</Select.Option> */}
          </Select>
        ),
        initialValue: "baidu",
      },
      // {
      // 	label: T.translate("TTS Sound"),
      // 	name: 'voice',
      // 	required: true,
      // 	component: <Select placeholder="voice" defaultValue={T.translate('女声')} >
      // 		<Select.Option value="male" >{T.translate('男声')}</Select.Option>
      // 		<Select.Option value="female" >{T.translate('女声')}</Select.Option>
      // 		</Select>,
      // 	initialValue: '女声'
      // },
      {
        label: T.translate("TTS Text"),
        name: "input",
        required: true,
        component: <EditControl placeholder="text" />,
      },
    ];

    return (
      <ModalForm
        {...props}
        title={T.translate("TTS")}
        okText={T.translate("Submit")}
        cancelText={T.translate("Close")}
        onCreate={this.handleSubmit}
        onCancel={this.props.onHide}
        items={formItems}
      />
    );
  }
}
class DeleteMediaFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      extn_name: [],
    };
  }
  componentDidMount() {
    xFetchJSON("/api/dicts?realm=DATE_TYPE", {
      method: "GET",
    })
      .then((result) => {
        //console.log(result);
        this.setState({ extn_name: result });
      })
      .catch((msg) => {
        console.error(msg);
      });
  }

  handleDeleteSubmit = (value) => {
    const newValue = {
      ...value,
    };
    newValue.regular = newValue.regular === true || newValue.regular === "1" ? true : false;

    xFetchJSON("/api/media_files/regular/" + newValue.threshold + "/" + newValue.regular, {
      method: "DELETE",
    })
      .then(() => {
        message.success(T.translate("Reguar Delete Successfully"));
        this.props.change_live_check();
      })
      .catch((msg) => {
        message.error(`${T.translate("Delete Error")}: ${msg?.message || msg?.text || msg}`);
      });
    this.props.onHide();
  };

  render() {
    const props = Object.assign({}, this.props);
    delete props.handleDeletedMediaFile;
    const { extn_name } = this.state;
    let extn_name_options = extn_name?.map((t) => {
      // const value = `${t.v} ${t.k?.includes('Month') ? T.translate('month') : T.translate('year')}`
      return [
        `${t.v}${t.k}`,
        `${t.v} ${t.k?.includes("Month") ? T.translate("month") : T.translate("year")}`,
      ];
    });

    const Regular = [
      {
        label: T.translate("Effective Immediately"),
        name: "regular",
        required: false,
        component: <EditControl type="switch" />,
        valuePropName: "checked",
      },
      {
        label: T.translate("Delete Threshold"),
        name: "threshold",
        required: true,
        component: <EditControl type="select" options={extn_name_options} />,
      },
    ];

    return (
      <ModalForm
        {...props}
        title={T.translate("Regular Delete")}
        okText={T.translate("Submit")}
        cancelText={T.translate("Close")}
        onCreate={this.handleDeleteSubmit}
        onCancel={this.props.onHide}
        items={Regular}
      />
    );
  }
}

// 录制
class NewRecordFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { recordingMSG: null, audio: null, context: "context-1" };

    this.handleFSEvent = this.handleFSEvent.bind(this);
    this.handleDeleteOneRecodring = this.handleDeleteOneRecodring.bind(this);
  }

  componentDidMount() {
    verto.subscribe("FSevent.custom::xui::record_start", { handler: this.handleFSEvent });
    verto.subscribe("FSevent.custom::xui::record_complete", { handler: this.handleFSEvent });
    xFetchJSON(`/api/globals?page=1&perPage=1000`)
      .then((data) => {
        data?.data?.map((d) => {
          if (d.k == "xui_default_outcall_context") {
            this.setState({ context: d.v });
          }
        });
      })
      .catch((msg) => {
        message.error("get globals data ERR :", msg);
      });
  }

  componentWillUnmount() {
    verto.unsubscribe("FSevent.custom::xui::record_start");
    verto.unsubscribe("FSevent.custom::xui::record_complete");
  }

  _handleDeleteOneRecodring(id) {
    let _this = this;

    xFetchJSON("/api/media_files/" + id, {
      method: "DELETE",
    })
      .then(() => {
        console.log("delete success");
      })
      .catch((msg) => {
        message.error(`${T.translate("Delete Error")}: ${msg?.message || msg?.text || msg}`);
      });

    _this.setState({ audio: null });
  }

  handleDeleteOneRecodring(id) {
    const _this = this;
    confirm({
      title: T.translate("Delete Record"),
      content: T.translate("Confirm to Delete ?"),
      okText: T.translate("OK"),
      cancelText: T.translate("Cancel"),
      okType: "danger",
      onOk() {
        _this._handleDeleteOneRecodring(id);
      },
      onCancel() {},
    });
  }

  handleFSEvent = async (v, e) => {
    console.log("FSevent:", e);

    if (e.eventChannel == "FSevent.custom::xui::record_start") {
      const path = e.data.rel_path;
      this.setState({
        recordingMSG: <T.span text={{ key: "Recording to", path: path }} />,
        audio: null,
      });
    } else if (e.eventChannel == "FSevent.custom::xui::record_complete") {
      //当录音成功时，请求后台数据，以匹配到该录音的对应的id,因为录音新录音的文件在最前面，所以可以用这种方式
      const mediaFiles = await xFetchJSON("/api/media_files?perPage=100&page=1");

      const recordedData = mediaFiles?.data?.filter(
        (file) => file.channel_uuid === e.data.channel_uuid,
      );

      console.log(recordedData);

      const path = e.data.rel_path;
      const recordedId = recordedData[0]?.id;
      const recordedExt = recordedData[0]?.ext;
      const src = `/api/media_files/${recordedId}.${recordedExt}`;
      this.setState({
        recordingMSG: <T.span text={{ key: "Record completed", path: path }} />,
        audio: (
          <div>
            <Col span={4}>录音试听：</Col>
            <Col span={8}>
              <AudioPlayerFetch src={src} />
            </Col>
            <Col>
              <Button
                onClick={() => {
                  this.handleDeleteOneRecodring(recordedId);
                }}
              >
                <T.span text="Delete" />
              </Button>
            </Col>
          </div>
        ),
      });
    }
  };

  doCallbackRecord() {
    console.log("callback record ...");
    verto.fsAPI(
      "bgapi",
      "originate user/" + this.refs.callbackNumber.value + " *991234 xml " + this.state.context,
      function (s) {
        console.log(s);
      },
      function (s) {
        console.error(s);
        notify(s);
      },
    );
  }

  handleOpenWebPhone(e) {
    e.preventDefault();
    e.stopPropagation();
    fire_event("verto-phone-open", "*991234");
  }

  handleOpenWebPhoneAndCall(e) {
    e.preventDefault();
    e.stopPropagation();
    fire_event("verto-phone-open-and-call", this.refs.callbackNumber.value);
  }

  render() {
    if (!this.props.visible) return null;
    // let audio = <audio src={this.state.path} controls="controls" />;

    return (
      <XytCard
        title={
          <h2>
            <T.span text="Record" />
          </h2>
        }
      >
        <Form id="newRecordFileForm">
          <Row>
            <Col span={24}>{this.state.recordingMSG}</Col>
            <br />
            <br />
            {this.state.audio}
          </Row>
          <hr />
          <Row>
            <Col span={18}>
              1. <T.span text="Use any phone, Call *991234 to record after BEEP" />
            </Col>
            <Col span={6}>
              {!is_webrtc_supported ? null : (
                <Button onClick={this.handleOpenWebPhone}>
                  <PhoneFilled />
                  <T.span text="Open WebRTC Phone" />
                </Button>
              )}
            </Col>
          </Row>
          <hr />
          <Row>
            <Col span={24}>
              2. <T.span text="Callback to record after BEEP" />
            </Col>
          </Row>
          <br />
          <Row>
            <Col span={3}></Col>
            <Col span={1} style={{ lineHeight: "29px" }}>
              <T.span text="Number" className="mandatory" />
            </Col>
            <Col span={20}>
              <input type="input" name="number" placeholder="1000" ref="callbackNumber" />
              &nbsp;
              <Button onClick={this.doCallbackRecord.bind(this)}>
                <PhoneFilled />
              </Button>
            </Col>
          </Row>
        </Form>
        <br />
        <br />
        <br />
      </XytCard>
    );
  }
}

class MediaFilesPage extends React.Component {
  constructor(props) {
    super(props);
    const { location } = props.params;
    const current = getQueryParam("page", location.search);
    this.state = {
      formShow: false,
      recordFormShow: false,
      showCustom: false,
      rows: [],
      checkData: [],
      extn_name: [],
      danger: false,
      progress: -1,
      readonly: false,
      perPage: localStorage.getItem("xui.mediaFilesPerPage") || 500,
      current: current * 1,
      live_check: false,
      total: 0,
      showSettings: false,
      searchmorediv: "none",
      lastValue: 0,
      ifbatchdelete: false,
      ifbatchdownload: false,
      waitValue: [], // 多选
      allCheck: false,
      upload_max_size: null,
      hideSearchBox: true,
      name_input_value: "",
      search_type: "ALL",
      activeIndex: 0,
      fileType: [],
      filters: "",
      tableScrollContent: 0,
      tableCellHeight: 44,
    };
    this.tableContentRef = null;
    this.search_str = ["startDate", "endDate", "cidNumber", "destNumber", "name"];
    this.handleMore = this.handleMore.bind(this);
  }

  UNSAFE_componentWillMount() {
    this.popStateFetch();
  }

  componentDidMount() {
    window.addEventListener("resize", this.resizeTableScrollContent);
    this.getFileType();
    // const readonly = this.props.params.location && this.props.params.location.pathname.match(/^\/settings/) ? false : true;
    const { location } = this.props.params;
    if (location.search) {
      // const search = location.search.substr(1);
      const current = getQueryParam("page", location.search);
      this.setState({ current });
      // this.getFetch(search);
    }

    var _this = this;

    xFetchJSON("/api/upload/upload_max_size")
      .then((data) => {
        _this.setState({ upload_max_size: data.upload_max_size });
      })
      .catch((msg) => {
        message.error(`error: ${msg}`);
      });

    xFetchJSON("/api/check/clean-file")
      .then((data) => {
        if (data.msg == "Already Running") {
          _this.setState({ live_check: true });
        } else {
          _this.setState({ live_check: false });
        }
      })
      .catch((msg) => {
        message.error(`error: ${msg}`);
      });
    // this.popStateFetch();
  }

  componentDidUpdate(prevProps, prevState) {
    // 如果recordFormShow状态改变，重新计算高度
    if (prevState.recordFormShow !== this.state.recordFormShow) {
      setTimeout(() => this.resizeTableScrollContent(), 100);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeTableScrollContent);
    this.setState = () => {
      return;
    };
  }

  getFileType = () => {
    xFetchJSON("/api/dicts?realm=MFILE_TYPE", {
      method: "GET",
    })
      .then((result) => {
        const obj = {};
        result?.map((i) => {
          obj[i.k] = i.v;
          return i;
        });
        const fileType = {
          ...Globals.media_type_map,
          ...obj,
        };
        this.setState(
          {
            fileType,
          },
          () => {
            this.resizeTableScrollContent();
          },
        );
      })
      .catch((msg) => {
        console.error(msg);
      });
  };

  handleControlClick = (data) => {
    var _this = this;

    if (data == "new") {
      // this.setState({ formShow: true});
      this.dropzone.open();
    } else if (data == "ivr") {
      this.setState({ formShow: true });
    } else if (data == "record") {
      this.setState({ recordFormShow: !this.state.recordFormShow }, () => {
        this.resizeTableScrollContent();
      });
    } else if (data == "settings") {
      this.setState({ showSettings: !this.state.showSettings });
    } else if (data == "custom") {
      this.setState({ showCustom: !this.state.showCustom });
    } else if (data == "regular") {
      this.setState({ deleteformShow: !this.state.deleteformShow });
    } else if (data == "cancel") {
      xFetchJSON("/api/media_files/cancel/regular", {
        method: "DELETE",
      })
        .then(() => {
          message.success(T.translate("Cancel Regular Delete Successfully"));
          _this.setState({ live_check: false });
        })
        .catch((msg) => {
          message.error(`${T.translate("Delete Error")}: ${msg?.message || msg?.text || msg}`);
        });
    }
  };

  handlerChannelLive = (data) => {
    this.setState({
      live_check: true,
    });
  };
  _handleDelete = (id) => {
    var _this = this;

    xFetchJSON("/api/media_files/" + id, {
      method: "DELETE",
    })
      .then(() => {
        message.success(T.translate("Delete Successfully"));
        var rows = _this.state.rows.filter(function (row) {
          return row.id != id;
        });
        var rowCount = rows.length;
        _this.setState({ rows, rowCount: rowCount });
      })
      .catch((msg) => {
        message.error(`${T.translate("Delete Error")}: ${msg?.message || msg?.text || msg}`);
      });
  };

  handleDelete = (value) => {
    console.log("deleting id", value);
    var _this = this;

    if (!this.state.danger) {
      confirm({
        title: T.translate("Delete Media File"),
        content: <T.span text={{ key: "DeleteItem", item: value.name }} />,
        cancelText: T.translate("Cancel"),
        okText: T.translate("OK"),
        okType: "danger",
        onOk() {
          _this._handleDelete(value.id);
        },
        onCancel() {},
      });
    } else {
      _this._handleDelete(value.id);
    }
  };

  handleMediaFileAdded = (data) => {
    var rows = [data].concat(this.state.rows);
    this.setState({ rows: rows, formShow: false });
  };

  handleMediaFileDelete = (data) => {
    var rows = [data].concat(this.state.rows);
    this.setState({ rows: rows, deleteformShow: false });
  };

  handleUploadFileType = (acceptedFiles) => {
    const rejectedMimeType = ["application/javascript", "text/html", "text/javascript"];
    const rejectedFileList = [];
    const acceptFileList = [];
    for (let i = 0; i < acceptedFiles.length; i++) {
      if (rejectedMimeType.includes(acceptedFiles[i].type)) {
        rejectedFileList.push(acceptedFiles[i]);
      } else {
        acceptFileList.push(acceptedFiles[i]);
      }
    }
    if (rejectedFileList.length > 0) {
      message.error(T.translate("Uploaded file type can not support html/htm/js"));
    }
    return acceptFileList;
  };

  onDrop = (acceptedFiles, rejectedFiles) => {
    const _this = this;
    console.log("Accepted files: ", acceptedFiles);
    console.log("Rejected files: ", rejectedFiles);
    acceptedFiles = this.handleUploadFileType(acceptedFiles);

    if (this.state.readonly) return;

    let data = new FormData();
    let total_file_size = 0;
    let upload_max_size = this.state.upload_max_size;

    for (var i = 0; i < acceptedFiles.length; i++) {
      data.append("file", acceptedFiles[i]);
      total_file_size = total_file_size + acceptedFiles[i].size;

      if (total_file_size > upload_max_size) {
        console.error("upload failed", "Max body size");
        message.error(<T.span text={{ key: "Internal Error", msg: "Max body size" }} />);
        return;
      }
    }

    let xhr = new XMLHttpRequest();
    const progressSupported = "upload" in xhr;

    xhr.onload = function () {
      _this.setState({ progress: 100 });
      _this.setState({ progress: -1 });
    };

    if (progressSupported) {
      xhr.upload.onprogress = function (e) {
        console.log("event", e);
        if (e.lengthComputable) {
          let progress = ((e.loaded / e.total) * 100) | 0;
          // console.log("complete", progress);
          _this.setState({ progress: progress });
          if (progress == 100) {
            xFetchJSON("/api/media_files")
              .then((data) => {
                // var rowCount;
                _this.setState({ rowCount: data.rowCount });
              })
              .catch((msg) => {
                message.error(`error: ${msg}`);
              });
          }
        }
      };
    } else {
      console.log("XHR upload progress is not supported in your browswer!");
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          // console.log('response=',xhr.responseText);
          let mfiles = JSON.parse(xhr.responseText);
          console.log(mfiles);
          _this.setState({ rows: mfiles.concat(_this.state.rows) });
        } else if (xhr.status == 413) {
          console.error("upload failed", "Max body size");
          // message.error(<T.span text={{ key: "Internal Error", msg: 'Max body size' }} />);
          message.error(T.translate("Internal Error") + T.translate("Max body size"));
          xhr.abort();
        } else if (xhr.status == 415) {
          console.error("upload failed", "File type does not match");
          message.error(T.translate("Internal Error") + T.translate("File type does not match"));
          // message.error(<T.span text={{ key: "Internal Error", msg: 'File type does not match' }} />);
          xhr.abort();
        }
      }
    };

    xhr.open("POST", "/api/upload");
    xhr.send(data);
  };

  handleSortClick = (field) => {
    let { rows, order } = this.state;

    var n = 1;

    if (order == "ASC") {
      order = "DSC";
      n = -1;
    } else {
      order = "ASC";
    }

    if (field == "file_size") {
      rows.sort(function (a, b) {
        return parseInt(a[field]) < parseInt(b[field]) ? -1 * n : 1 * n;
      });
    } else {
      rows.sort(function (a, b) {
        return a[field] < b[field] ? -1 * n : 1 * n;
      });
    }

    this.setState({ rows, order });
  };

  handleRowsChange = (e) => {
    const perPage = parseInt(e.target.value);
    if (!perPage) return;
    localStorage.setItem("xui.mediaFilesPerPage", perPage);
    // 切换页数后返回到第一页，确定是否有已添加的查询条件
    const pagination = { ...this.state.pagination };
    this.popStateFetch();
    this.setState({ perPage: perPage, pagination: { ...pagination, current: 1 } });
  };

  handleFilter = () => {
    const { filters } = this.state;
    if (filters) {
      this.getFetch(filters);
      return;
    }
    this.getFetch();
  };

  handleSearch = () => {
    let qs = "";
    this.setState({ current: 1 });
    const { search_type, name_input_value } = this.state;
    this.search_str.forEach((data, key) => {
      if (!judgeUselessParam(this[data])) {
        if (key === 0 && (search_type == "ALL" || search_type == "RECORD")) {
          qs = `${data}=${this[data]}`;
        } else {
          if (search_type == "ALL" || search_type == "RECORD") {
            qs = qs + `&${data}=${this[data]}`;
          } else {
            qs = data == "startDate" || data == "endDate" ? "" : qs + `&${data}=${this[data]}`;
          }
        }
      }
    });

    if (name_input_value) {
      qs += `&name=${name_input_value}`;
    }
    if (search_type && search_type !== "ALL") {
      qs += `&type=${search_type}`;
    }
    this.setState({ filters: qs }, () => this.handleFilter());
  };

  handleReset = () => {
    this.cidNumber = "";
    this.destNumber = "";
    this.name = "";
    this.startDate = moment(new Date()).subtract(7, "days").format("YYYY-MM-DD");
    this.endDate = moment(new Date()).format("YYYY-MM-DD");
    this.setState(
      {
        search_type: "ALL",
        name_input_value: "",
        visitData: [],
        if_statistics_display: false,
        filters: null,
        current: 1,
      },
      () => {
        this.getFetch(`startDate=${this.startDate}&endDate=${this.endDate}`);
      },
    );
  };

  getFetch = (qs) => {
    this.setState({ loading: true });
    const { perPage, current } = this.state;
    const { pathname } = this.props.params.location;
    let url = `/api/media_files?perPage=${perPage}&page=${current ? current : 1}`;
    if (qs) {
      url += `&${qs}`;
    }
    xFetchJSON(url)
      .then((res) => {
        this.setState(
          {
            loading: false,
            rows: res.data,
            current: res.page > 0 ? res.page : 1,
            total: res.rowCount,
          },
          () => {
            this.resizeTableScrollContent();
          },
        );
        const str = `${document.location.pathname}#${pathname}`;
        if (qs) {
          let newStr = `${str}?${qs}`.replace(/\?&/g, "?");
          history.replaceState(null, null, newStr);
        } else {
          history.replaceState(null, null, str);
        }
      })
      .catch((msg) => {
        message.error(msg);
      });
  };

  // 控制地址栏看是否有已添加的查询条件
  popStateFetch = () => {
    const _this = this;
    const location = this.props.params.location;
    if (location.search) {
      const search = location.search;
      const searchKey = location.search.substr(1);
      const params = new URLSearchParams(searchKey);
      this.setState({ search_type: params?.get("type") || "ALL" });
      this.search_str.forEach((data) => {
        _this[data] = getQueryParam(data, search);
      });
      if (this.name) {
        this.setState({ name_input_value: this.name });
      }
      const page = getQueryParam("page", search);

      const pagination = { ...this.state.pagination };

      if (this.startDate || this.endDate || this.cidNumber || this.destNumber || this.name) {
        this.setState({ searchState: true, hideSearchBox: false });
        if (page) {
          _this.setState({ pagination: { ...pagination, current: page } });
        }
      }
      _this.getFetch(searchKey);
    } else {
      const startDates = moment(new Date()).subtract(7, "days").format("YYYY-MM-DD");
      const endDates = moment(new Date()).format("YYYY-MM-DD");
      this.getFetch(`startDate=${startDates}&endDate=${endDates}`);
    }
  };

  handleQuery = (e) => {
    var data = parseInt(e.target.getAttribute("data"));
    this.setState({ searchState: false });
    this.days = data;
    localStorage.setItem("page_media_files.lastValue", this.days);
    e.preventDefault();
    if (this.days !== undefined) {
      this.getFetch(`last=${this.days}`);
      var now = new Date();
      let dateFormat = "YYYY-MM-DD";
      var daysBeforeToday = moment(now).subtract(this.days, "days").format(dateFormat);
      this.startDate = daysBeforeToday;
    } else {
      this.getFetch("");
    }
  };

  handleMore(e) {
    e.preventDefault();
    this.setState({ hideSearchBox: !this.state.hideSearchBox });
  }

  handleDownload = (package_no, rows) => {
    console.log("handleDownload package_no rows", package_no, rows);
    let zip_count = 0;
    let zip = new JSZip();
    var valid_rows = rows.filter(function (row) {
      // return row.name && row.rel_path && row.dir_path;
      return row.name && row.rel_path;
    });

    console.log("valid_rows", valid_rows, valid_rows.length);

    valid_rows.forEach((row) => {
      // let dir_path = row.dir_path;

      // 获取文件生成时间
      let created_at = row.created_at;

      // let src_path_index = dir_path.indexOf("/upload");
      // if (src_path_index == -1) {
      // 	src_path_index = dir_path.indexOf("/recordings");
      // }

      // if (src_path_index == -1) {
      // 	console.log("export err:", "dir_path value is err\n");
      // 	return;
      // }

      // let src = dir_path.substr(src_path_index) + '/' + row.rel_path;
      // console.log("export_src:", src);

      const src = `/api/media_files/${row.id}.${row?.ext}`;
      JSZipUtils.getBinaryContent(src, function (err, data) {
        if (err) {
          throw err; // or handle the error
        }

        // 添加文件类型
        // if (row.description != "UPLOAD") {
        // 	if (row.ext) {
        // 		row.name = row.name + "." + row.ext;
        // 	} else {
        // 		row.name = row.name + ".mp3";
        // 	}
        // }

        // 规定文件下载名格式为：年-月-日-时-分-秒-文件名
        var d = new Date(created_at).Format("yyyy-MM-dd-hh-mm-ss");
        let down_file_name = d + "-" + row.name;
        if (!row.name.endsWith(row.ext)) {
          down_file_name += "." + row.ext;
        }
        console.log("down_file_name", down_file_name);

        zip.file(down_file_name, data, { binary: true });
        zip_count++;
        if (zip_count == valid_rows.length) {
          let now = new Date().Format("yyyy-MM-dd-hh-mm-ss");

          let zip_file_name = "MediaFiles-" + now + "-" + package_no;
          zip.generateAsync({ type: "blob" }).then(function (content) {
            saveAs(content, zip_file_name);
          });
        }
      });
    });
  };

  handleOnOk = (rows) => {
    console.log(rows);
    var result = [];
    var package_no = 1;
    message.info(T.translate("Download has started, please wait patiently!"));
    for (var i = 0; i < rows.length; i += 10) {
      result = rows.slice(i, i + 10);
      this.handleDownload(package_no, result);
      package_no += 1;
    }
    return;
  };

  handleBatch = (event) => {
    const { waitValue, rows } = this.state;
    const rowsMap = {};
    rows.map((data) => {
      rowsMap[data.id] = data;
    });
    if (event === "download") {
      const download_rows = waitValue.map((id) => {
        return rowsMap[id];
      });
      console.log("download_rows", download_rows, download_rows.length);

      if (waitValue.length === 0) {
        message.info(T.translate("Please select the content to download"));
      } else if (download_rows.length > 10) {
        Modal.confirm({
          // title: T.translate('Confirm'),
          content: T.translate("Download Prompt"),
          okText: T.translate("Ok"),
          cancelText: T.translate("Cancel"),
          width: "500px",
          onOk: () => {
            this.handleOnOk(download_rows);
          },
          onCancel: () => {
            return;
          },
        });
      } else if (download_rows.length === 1) {
        const down_file_info = download_rows[0];

        let created_at = down_file_info.created_at;
        var d = new Date(created_at).Format("yyyy-MM-dd-hh-mm-ss");
        let rel_path = down_file_info.rel_path;
        let file_name = down_file_info.name;
        if (!down_file_info.name.endsWith(down_file_info.ext)) {
          file_name += "." + down_file_info.ext;
        }
        let dir_path = down_file_info.dir_path;
        let ext = "mp3";
        if (down_file_info?.ext) {
          ext = down_file_info.ext;
        }
        if (!rel_path) {
          console.log("err", "rel_path is null\n");
          return;
        }

        let src_path_index = dir_path.indexOf("/upload");
        if (src_path_index == -1) {
          src_path_index = dir_path.indexOf("/recordings");
        }

        // if (src_path_index == -1) {
        // 	console.log("ERR:", "dir_path value is err\n");
        // 	return;
        // }

        // let src = dir_path.substr(src_path_index) + '/' + rel_path;

        // console.log("export_src:", src);
        const src = `/api/media_files/${down_file_info.id}.${ext}`;
        var downloadLink = document.createElement("a");
        downloadLink.href = src;
        downloadLink.download = d + "-" + file_name;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        message.info(T.translate("Download has started, please wait patiently!"));
        document.body.removeChild(downloadLink);
      } else {
        console.log("下载数量 2 - 9");
        const package_no = 1;
        message.info(T.translate("Download has started, please wait patiently!"));
        this.handleDownload(package_no, download_rows);
      }
      this.handleBatchSwitch("cancel");
    } else if (event === "delete") {
      if (waitValue.length === 0) {
        message.info(T.translate("Please select the option to be deleted"));
      } else {
        var c = confirm(T.translate("Confirm to Delete ?"));
        if (!c) {
          this.handleBatchSwitch("cancel");
        }
        waitValue.forEach((id) => {
          xFetchJSON("/api/media_files/" + id, {
            method: "DELETE",
          })
            .then(() => {
              const after_rows = rows.filter((row) => {
                return row.id !== id;
              });
              this.setState({ rows: after_rows });
            })
            .catch((msg) => {
              message.error(`${T.translate("Delete Error")}: ${msg?.message || msg?.text || msg}`);
            });
        });
      }
      this.handleBatchSwitch("cancel");
    }
  };

  handleBatchCheck = (ev, id) => {
    console.log("checkbok click", ev, id);
    let { waitValue, rows } = this.state;
    let allCheck = false;
    if (ev == "all") {
      if (waitValue.length === rows.length) {
        waitValue = [];
        allCheck = false;
      } else {
        waitValue = rows.map((row) => {
          return row.id;
        });
        allCheck = true;
      }
    } else {
      if (waitValue.indexOf(id) === -1) {
        // 不存在,则添加
        waitValue.push(id);
      } else {
        // 存在,则删除
        waitValue.splice(waitValue.indexOf(id), 1);
      }
    }
    this.setState({ allCheck: allCheck, waitValue: waitValue });
  };

  handleBatchSwitch = (event) => {
    if (event === "delete") {
      let ifbatchdelete = !this.state.ifbatchdelete;
      let ifbatchdownload = this.state.ifbatchdownload;
      if (ifbatchdelete) {
        ifbatchdownload = false;
      }
      this.setState({ ifbatchdelete: ifbatchdelete, ifbatchdownload: ifbatchdownload });
    } else if (event === "download") {
      let ifbatchdownload = !this.state.ifbatchdownload;
      let ifbatchdelete = this.state.ifbatchdelete;
      if (ifbatchdownload) {
        ifbatchdelete = false;
      }
      this.setState({ ifbatchdownload: ifbatchdownload, ifbatchdelete: ifbatchdelete });
    } else {
      this.setState({
        ifbatchdownload: false,
        ifbatchdelete: false,
        allCheck: false,
        waitValue: [],
      });
    }
  };

  handleStampChange = (value) => {
    const _this = this;
    if (value["startValue"]) {
      _this.startDate = moment(value["startValue"]).format("YYYY-MM-DD");
    } else if (value["endValue"]) {
      _this.endDate = moment(value["endValue"]).format("YYYY-MM-DD");
    } else {
      return;
    }
  };

  handleChange = (value, theKey) => {
    this[theKey] = value;
    this.setState({
      [theKey]: value,
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });

    let qs = `page=${pager.current}`;

    if (
      JSON.stringify(sorter) !== "{}" &&
      sorter.field !== undefined &&
      sorter.order !== undefined
    ) {
      qs = qs + `&sortField=${sorter.field}&sortOrder=${sorter.order}`;
    }

    if (!this.state.hideSearchBox || this.state.searchState) {
      qs =
        qs +
        "&startDate=" +
        this.startDate +
        "&endDate=" +
        this.endDate +
        "&cidNumber=" +
        this.cidNumber +
        "&destNumber=" +
        this.destNumber;
    } else {
      qs = qs + "&last=" + this.days;
    }

    this.setState({ sorter: sorter });
    this.getFetch(qs);
  };

  resizeTableScrollContent = () => {
    if (this.tableContentRef) {
      const rect = this.tableContentRef.getBoundingClientRect();
      const height = rect.height;
      if (height > 0) {
        // 只有当高度大于0时才更新状态
        this.setState({
          tableScrollContent: height - this.state.tableCellHeight,
        });
      }
    }
  };

  renderSearch = () => (
    <Row style={{ marginBottom: 24, marginTop: 8 }} gutter={[24, 16]}>
      <Col>
        <Input
          value={this.state.name_input_value}
          allowClear
          placeholder={T.translate("Name")}
          onChange={(e) => {
            e.persist();
            this.handleChange(e.target.value, "name_input_value");
          }}
        />
      </Col>
      {(this.state.search_type == "ALL" || this.state.search_type == "RECORD") && (
        <>
          <Col>
            <DateRange
              startDefaultValue={moment(this.startDate, dateFormat)}
              endDefaultValue={moment(this.endDate, dateFormat)}
              onStampChange={this.handleStampChange}
            />
          </Col>
          <Col>
            <Input
              allowClear
              value={this.cidNumber}
              placeholder={T.translate("CID Number")}
              onChange={(e) => {
                e.persist();
                this.handleChange(e.target.value, "cidNumber");
              }}
            />
          </Col>
          <Col>
            <Input
              allowClear
              value={this.destNumber}
              placeholder={T.translate("Dest Number")}
              onChange={(e) => {
                e.persist();
                this.handleChange(e.target.value, "destNumber");
              }}
            />
          </Col>{" "}
        </>
      )}
      <Col>
        <Space>
          <Button
            style={{ color: "#6F7787" }}
            icon={<CloseOutlined />}
            onClick={this.handleReset}
          />
          {Permission_List.buttons && Permission_List.buttons.media_files_search && (
            <Button type="primary" icon={<SearchOutlined />} onClick={this.handleSearch} />
          )}
        </Space>
      </Col>
    </Row>
  );

  handleFilterClick = (search_type) => {
    this.setState({ search_type }, () => {
      this.handleSearch();
    });
  };

  renderFilter = () => {
    const { fileType } = this.state;
    return (
      <Space style={{ marginBottom: 16 }}>
        {Object.keys(fileType).map((item, index) => (
          <div
            key={item}
            onClick={() => this.handleFilterClick(item)}
            style={{ color: item === this.state.search_type ? "" : "#00000040", cursor: "pointer" }}
          >
            <T.span text={fileType[item]} />
            {index !== Object.keys(fileType).length - 1 && <Divider type="vertical" />}
          </div>
        ))}
      </Space>
    );
  };

  handlePageSizeOnChange = (perPage, pagination, queryStr) => {
    localStorage.setItem("xui.mediaFilesPerPage", pagination.pageSize);
    this.setState(
      {
        ...pagination,
        perPage: pagination.pageSize,
      },
      () => {
        if (queryStr) {
          this.getFetch(queryStr);
        } else {
          this.getFetch("");
        }
      },
    );
  };

  handlePageOnChange = (current, pagination) => {
    this.setState({ ...pagination }, () => {
      this.handleFilter();
    });
  };
  toggleDanger = () => {
    this.setState({ danger: !this.state.danger });
  };

  render() {
    const _this = this;
    const hand = { cursor: "pointer" };
    const { rows, ifbatchdownload, ifbatchdelete, waitValue, allCheck, live_check } = this.state;
    const formClose = () => this.setState({ formShow: false });
    const deleteformClose = () => this.setState({ deleteformShow: false });
    const customClose = () => this.setState({ showCustom: false });
    const toggleDanger = () => this.setState({ danger: !this.state.danger });
    const danger = this.state.danger ? "danger" : "";
    const settings = this.state.readonly ? "" : "/";
    const days = this.days ? this.days : 7;
    const now = new Date();
    // const nowdate = Date.parse(now);
    // const sevenDaysBeforenowtime = nowdate - 7 * 24 * 60 * 60 * 1000;
    // const sevenDaysBeforenowdate = new Date(sevenDaysBeforenowtime);
    // const sevenDaysBeforeToday = getTime(sevenDaysBeforenowdate);
    // const choosenStyle = { backgroundColor: "#337ab7", color: "#fff" };

    const today = moment(now).format(dateFormat);
    // 向前找days天数
    const daysBeforeToday = moment(now).subtract(days, "days").format(dateFormat);

    this.startDate = this.startDate === undefined ? daysBeforeToday : this.startDate;
    this.endDate = this.endDate === undefined ? today : this.endDate;

    // function getTime(time) {
    // 	let month = (time.getMonth() + 1);
    // 	let day = time.getDate();
    // 	if (month < 10)
    // 		month = "0" + month;
    // 	if (day < 10)
    // 		day = "0" + day;
    // 	return time.getFullYear() + '-' + month + '-' + day;
    // }

    const progress_bar =
      this.state.progress < 0 ? null : (
        <Progress percent={this.state.progress} label={`${this.state.progress}%`} />
      );

    rows.forEach((data, key) => {
      data.key = key;
    });

    let columns = [
      {
        title: T.translate("ID"),
        dataIndex: "id",
        key: "id",
        width: 80,
      },
      {
        title: T.translate("Name"),
        dataIndex: "name",
        key: "name",
        width: window.innerWidth < 768 ? 200 : 350,
        render: (data, value) => (
          <Tooltip title={data}>
            <div
              style={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              <Link to={`${settings}media_files/${value.id}`}>{data.substring(0, 36)}</Link>
            </div>
          </Tooltip>
        ),
      },
      {
        title: T.translate("Type"),
        dataIndex: "type",
        key: "type",
        width: 100,
        render: (data, value) => (
          <Tooltip title={data}>
            <div
              style={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {T.translate(value.type)}
            </div>
          </Tooltip>
        ),
      },
      {
        title: T.translate("Description"),
        dataIndex: "description",
        key: "description",
        ...(window.innerWidth < 1440 && { width: 200 }),
        render: (data, value) => (
          <Tooltip title={data}>
            <div
              style={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {data}
            </div>
          </Tooltip>
        ),
      },
      {
        title: T.translate("Size"),
        dataIndex: "file_size",
        key: "file_size",
        width: 100,
        align: "right",
        render: (data, value) => formatSizeUnits(value.file_size),
      },
      {
        title: T.translate("Created At"),
        dataIndex: "created_at",
        key: "created_at",
        width: 240,
      },
      {
        title: T.translate("Operation"),
        dataIndex: "abs_path",
        key: "abs_path",
        width: 100,
        fixed: "right",
        render: (_, record) => {
          let url = "";
          let media_type = (record.mime || "").split("/")[0];
          if (record.mime == "x-xui/phrase") media_type = "audio";
          if (media_type === "audio" || media_type === "video") {
            url = "/api/media_files/" + record.id + "." + record.ext;
            return <XAudio text={T.translate("Play")} url={url} />;
          } else {
            return <></>;
          }
        },
      },
    ];

    if (
      !ifbatchdownload &&
      !ifbatchdelete &&
      Permission_List.buttons &&
      Permission_List.buttons.media_files_delete
    ) {
      columns = [
        ...columns,
        {
          title: <T.span text="" />,
          width: 120,
          fixed: "right",
          key: "delete",
          render: (_, value) => (
            <T.a onClick={() => _this.handleDelete(value)} text="Delete" className={danger} />
          ),
        },
      ];
    }

    if (ifbatchdownload) {
      columns = [
        ...columns,
        {
          title: (
            <Checkbox
              checked={allCheck}
              onClick={() => {
                _this.handleBatchCheck("all");
              }}
            >
              <b>{T.translate("Select All")}</b>
            </Checkbox>
          ),
          key: "download",
          width: 120,
          render: (_, value) => (
            <Checkbox
              checked={!(waitValue.indexOf(value.id) === -1)}
              onChange={() => {
                _this.handleBatchCheck("solo", value.id);
              }}
            />
          ),
        },
      ];
    }

    if (ifbatchdelete) {
      columns = [
        ...columns,
        {
          title: (
            <Checkbox
              checked={allCheck}
              onClick={() => {
                _this.handleBatchCheck("all");
              }}
            >
              <b>{T.translate("Select All")}</b>
            </Checkbox>
          ),
          key: "deleteall",
          render: (_, value) => (
            <Checkbox
              checked={!(waitValue.indexOf(value.id) === -1)}
              onChange={() => {
                _this.handleBatchCheck("solo", value.id);
              }}
            />
          ),
        },
      ];
    }

    return (
      <Dropzone
        ref={(node) => {
          this.dropzone = node;
        }}
        onDrop={this.onDrop}
        disableClick={true}
        noClick
      >
        {({ getRootProps, getInputProps, isDragAccept }) => (
          <div
            style={{ height: "100%" }}
            {...getRootProps({
              className: isDragAccept ? "dropzone_active" : "dropzone",
            })}
          >
            <input {...getInputProps()} />
            <div className="flex-column" style={{}}>
              <div id="breadcrumb-header">
                <Breadcrumb separator=">">
                  <Breadcrumb.Item>
                    <T.span text="Advanced" />
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <T.span text="Function" />
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <NavLink to={"/media_files"}>
                      <T.span text="Media Files" />
                    </NavLink>
                  </Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div id="page-media-files" style={{ display: "flex", flex: 1 }}>
                <XytCard
                  title={<div></div>}
                  style={{ display: "flex", flexDirection: "column", flex: 1 }}
                  bodyStyle={{ display: "flex", flexDirection: "column", flex: 1 }}
                >
                  {this.renderFilter()}
                  <div style={{}}>{this.renderSearch()}</div>
                  <XytCard
                    title={<div />}
                    style={{ height: "100%", display: "flex", flexDirection: "column", flex: 1 }}
                    bodyStyle={{
                      marginTop: 0,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "auto",
                      flex: 1,
                    }}
                    // extra={(

                    // )}
                    footer={
                      <div style={{ flexShrink: 0 }}>
                        <Pagination
                          pageSizeOnChange={this.handlePageSizeOnChange}
                          total={this.state.total}
                          perPage={this.state.perPage}
                          pageOnChange={this.handlePageOnChange}
                          current={this.state.current}
                        />
                      </div>
                    }
                  >
                    {/* <div className="pull-right" style={{ textAlign: 'right', paddingBottom: 20 }}>
										<div style={{paddingRight: '8px'}}>
										<T.span text="Last" /> &nbsp;
										<Space size={1} split={<Divider type="vertical" />}>
											<T.a onClick={this.handleQuery} text={{ key: "days", day: 7 }} data="7" style={this.state.lastValue == 7 ? choosenStyle : {}} />
											<T.a onClick={this.handleQuery} text={{ key: "days", day: 15 }} data="15" style={this.state.lastValue == 15 ? choosenStyle : {}} />
											<T.a onClick={this.handleQuery} text={{ key: "days", day: 30 }} data="30" style={this.state.lastValue == 30 ? choosenStyle : {}} />
											<T.a onClick={this.handleQuery} text={{ key: "days", day: 60 }} data="60" style={this.state.lastValue == 60 ? choosenStyle : {}} />
											<T.a onClick={this.handleQuery} text={{ key: "days", day: 90 }} data="90" style={this.state.lastValue == 90 ? choosenStyle : {}} />
											<T.a onClick={this.handleMore} text="More" data="more" />
										</Space>
										...
									</div>
										<div style={{padding: '10px 18px'}}>
										<T.span text="Total Rows" />: {this.state.rowCount} &nbsp;&nbsp;
										<T.span text="Current Page/Total Page" />: {this.state.page}/{this.state.pageCount}
									</div>
									</div> */}

                    <NewRecordFile visible={_this.state.recordFormShow} />
                    <Row
                      style={{ marginBottom: "10px" }}
                      justify={"space-between"}
                      gutter={[0, 24]}
                    >
                      <Col>
                        {!this.state.readonly && (
                          <div>
                            {Permission_List.buttons &&
                              Permission_List.buttons.media_files_upload && (
                                <Button
                                  type="primary"
                                  icon={<CloudUploadOutlined />}
                                  onClick={() => this.handleControlClick("new")}
                                >
                                  <T.span text="Upload a file" />
                                </Button>
                              )}
                            {Permission_List.buttons && Permission_List.buttons.media_files_tts && (
                              <Button
                                style={{
                                  borderTopRightRadius: 0,
                                  borderBottomRightRadius: 0,
                                  marginLeft: 8,
                                }}
                                onClick={() => this.handleControlClick("custom")}
                              >
                                <T.span text="Custom" />
                              </Button>
                            )}
                            <ButtonGroup>
                              {Permission_List.buttons &&
                                Permission_List.buttons.media_files_tts && (
                                  <Button
                                    icon={<PlusOutlined />}
                                    style={{ borderRadius: "0", marginLeft: "-1px" }}
                                    onClick={() => this.handleControlClick("ivr")}
                                  >
                                    <T.span text="TTS" />
                                  </Button>
                                )}
                              {Permission_List.buttons &&
                                Permission_List.buttons.media_files_record && (
                                  <Button
                                    onClick={() => this.handleControlClick("record")}
                                    style={{ marginRight: 8 }}
                                  >
                                    {this.state.recordFormShow ? (
                                      <>
                                        <StopOutlined /> {T.translate("Cancel")}
                                      </>
                                    ) : (
                                      <>
                                        <CaretRightOutlined /> {T.translate("Record")}
                                      </>
                                    )}
                                  </Button>
                                )}
                            </ButtonGroup>
                            <ButtonGroup>
                              {/* {
															Permission_List.buttons && Permission_List.buttons.media_files_batch_delete &&
															(_this.state.ifbatchdelete ? <React.Fragment>
																<Button icon={<StopOutlined />} onClick={() => { _this.handleBatchSwitch("cancel") }}>
																	{T.translate('Cancel')}
																</Button>
																<Button
																	icon={<DeleteOutlined />}
																	onClick={() => this.handleBatch('delete')}
																	type="danger"
																>
																	{T.translate("Delete")}
																</Button>
															</React.Fragment> : <Button
																icon={<DeleteOutlined />}
																onClick={() => { _this.handleBatchSwitch("delete") }}
																title={T.translate("Delete")}
															>
																{T.translate("Delete")}
															</Button>
															)
														} */}
                              <ButtonGroup>
                                {Permission_List.buttons &&
                                  Permission_List.buttons.media_files_batch_download &&
                                  (_this.state.ifbatchdownload ? (
                                    <React.Fragment>
                                      <Button
                                        icon={<StopOutlined />}
                                        onClick={() => {
                                          _this.handleBatchSwitch("cancel");
                                        }}
                                      >
                                        {T.translate("Cancel")}
                                      </Button>
                                      <Button
                                        icon={<DownloadOutlined />}
                                        onClick={() => _this.handleBatch("download")}
                                      >
                                        {T.translate("Download")}
                                      </Button>
                                    </React.Fragment>
                                  ) : (
                                    <Button
                                      icon={<DownloadOutlined />}
                                      onClick={() => {
                                        _this.handleBatchSwitch("download");
                                      }}
                                      title={T.translate("Export")}
                                      style={{ borderRadius: 2 }}
                                    >
                                      {T.translate("Export")}
                                    </Button>
                                  ))}
                              </ButtonGroup>
                              <ButtonGroup>
                                {Permission_List.buttons &&
                                  Permission_List.buttons.media_files_tts &&
                                  (!live_check ? (
                                    <Button
                                      id="btn"
                                      type="primary"
                                      onClick={() => this.handleControlClick("regular")}
                                    >
                                      {T.translate("Regular Delete")}
                                    </Button>
                                  ) : (
                                    <Button
                                      id="btn"
                                      type="danger"
                                      onClick={() => this.handleControlClick("cancel")}
                                    >
                                      {T.translate("Cancel Regular Delete")}
                                    </Button>
                                  ))}
                              </ButtonGroup>
                            </ButtonGroup>
                          </div>
                        )}
                      </Col>
                      <Col>
                        {Permission_List.buttons &&
                        Permission_List.buttons.media_files_batch_delete ? (
                          <Space>
                            <T.span text="Fast Delete Mode" />
                            <Switch
                              defaultChecked={this.state.danger}
                              onClick={() => this.toggleDanger()}
                            />
                          </Space>
                        ) : null}
                      </Col>
                    </Row>
                    <div className="media-files-table-content">
                      {progress_bar}
                      <div className="table-content">
                        <div
                          className="table-content-fixed"
                          ref={(ref) => {
                            this.tableContentRef = ref;
                          }}
                        >
                          <Table
                            {...Globals.TableConfig}
                            columns={columns}
                            dataSource={rows}
                            loading={_this.state.loading}
                            scroll={{
                              y: "calc(100vh - 432px)",
                            }}
                            components={VList({
                              height: "calc(100vh - 432px)",
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <NewMediaFile
                      visible={this.state.formShow}
                      onHide={formClose}
                      mfiles={this.state.rows}
                      handleNewMediaFileAdded={this.handleMediaFileAdded}
                    />
                    <DeleteMediaFile
                      visible={this.state.deleteformShow}
                      change_live_check={this.handlerChannelLive}
                      onHide={deleteformClose}
                      mfiles={this.state.rows}
                      handleDeletedMediaFile={this.handleMediaFileDelete}
                    />
                    <NewCustom
                      open={_this.state.showCustom}
                      onHide={customClose}
                      getFileType={this.getFileType}
                    />
                  </XytCard>
                </XytCard>
              </div>
            </div>
          </div>
        )}
      </Dropzone>
    );
  }
}

export default MediaFilesPage;
