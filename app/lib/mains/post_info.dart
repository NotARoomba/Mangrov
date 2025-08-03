import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mangrov/branding.dart';

class PostInfo extends StatefulWidget {
  final DocumentSnapshot data;
  const PostInfo({super.key,
  required this.data
  });

  @override
  State<PostInfo> createState() => _PostInfoState();
}

class _PostInfoState extends State<PostInfo> {

  Branding br = Branding();
  PageController controller = PageController();
  String uid = FirebaseAuth.instance.currentUser!.uid;

   


  @override
  Widget build(BuildContext context) {

    List images = widget.data['images'];
    List products = widget.data['productIds'];

    return Scaffold(
      bottomNavigationBar: BottomAppBar(
        color: br.black,
        child: SizedBox(
          width: double.infinity,
          child: TextButton.icon(
            style: ButtonStyle(
              backgroundColor: WidgetStatePropertyAll(Colors.green),
              shape: WidgetStatePropertyAll(RoundedRectangleBorder(
                borderRadius: BorderRadiusGeometry.circular(12)
              ))
            ),
            onPressed: () async {
              try {
                await FirebaseFirestore.instance.collection('users').doc(uid).collection('cart').doc(widget.data.id).set({
                  'date':DateTime.now(),
                  'postID':widget.data.id,
                  'collection':""
                });
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Saved to cart.')));
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Something went wrong. Could not save to cart.')));
              }
            }, 
            icon: Icon(Icons.shopping_cart, color: br.white,),
            label: Text('SAVE TO CART',
            style: GoogleFonts.inter(
              color: br.white,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.1
            ),
            )),
        ),
      ),
      backgroundColor: br.black,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadiusGeometry.only(
                bottomRight: Radius.circular(12),
                bottomLeft: Radius.circular(12)
              )
            ),
            backgroundColor: br.black,
            iconTheme: IconThemeData(
              size: 20,
              color: Colors.grey[700]
            ),
          )
        ], 
        
        body: SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child: Column(
            children: [

              SizedBox(
                height: 400,
                child: PageView.builder(
                  controller: controller,
                  itemCount: images.length,
                  itemBuilder: ((context, index) {
                    return Image.network(images[index], fit: BoxFit.contain,);
                  })
                ),
              ),

              Padding(
                padding: const EdgeInsets.only(top: 10.0),
                child: ListTile(
                  title: Text(widget.data['title'],
                  style: GoogleFonts.inter(
                    color: br.white,
                    fontWeight: FontWeight.w700
                  ),
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 5.0),
                    child: Text(widget.data['description'],
                    style: GoogleFonts.inter(
                      color: br.white,
                      fontWeight: FontWeight.w500
                    ),
                    ),
                  ),
                ),
              ),   

              Row(
                children: [

                  widget.data['likes'] == true ? IconButton(
                    onPressed: () {}, 
                    icon: Icon(Icons.favorite_border, color: Colors.red, size: 20,)
                  ) : Container(),

                  // widget.data['saves'] == true ? IconButton(
                  //   onPressed: () {}, 
                  //   icon: Icon(Icons.bookmark_border, color: Colors.grey, size: 20,)
                  // ) : Container(),

                  widget.data['comments'] == true ? IconButton(
                    onPressed: () {}, 
                    icon: Icon(Icons.question_answer_outlined, color: br.white, size: 20,)
                  ) : Container(),




                ],
              ),


              StreamBuilder(
                stream: FirebaseFirestore.instance.collection('businesses').doc(widget.data['business']).snapshots(),
                builder: (context, asyncSnapshot) {

                  if (asyncSnapshot.hasData) {

                    DocumentSnapshot data = asyncSnapshot.data!;

                    return ListTile(

                      trailing: TextButton(
                        onPressed: () async {}, 
                        child: Text('message',
                        style: GoogleFonts.inter(
                          color: Colors.green,
                          fontSize: 13
                        ),
                        )
                      ),
                      title: Text(data['displayName'],
                      style: GoogleFonts.inter(
                        color: br.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700
                      ),
                      ),

                      leading: CircleAvatar(
                        radius: 20,
                        backgroundColor: Colors.green,
                        backgroundImage: NetworkImage(data['displayImage']),
                      ),
                    );
                  }
                  return ListTile();
                }
              ),

              

              
              
              ListTile(
                title: Text('Listed Products'.toUpperCase(),
                style: GoogleFonts.inter(
                  color: br.white,
                  fontWeight: FontWeight.w800
                ),
                ),
              ),

              Padding(
                padding: const EdgeInsets.only(top: 10.0, left: 15),
                child: SizedBox(
                  height: 225,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: products.length,
                    shrinkWrap: true,
                    
                    itemBuilder: ((context, index) {
                  
                      return StreamBuilder(
                        stream: FirebaseFirestore.instance.collection('businesses').doc(widget.data['business']).collection('products').doc(products[index]).snapshots(), 
                        builder: ((context, snapshot) {
                
                          if (snapshot.hasData) {
                            DocumentSnapshot arrdata = snapshot.data!;

                            
                
                          return arrdata.exists ? Container(
                            margin: EdgeInsets.symmetric(horizontal: 5),
                            height: 225,
                            width: 200,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              color: br.bg
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.only(left: 10.0, right: 10, top: 10),
                                  child: ClipRRect(
                                    borderRadius: BorderRadiusGeometry.circular(12),
                                    child: Image.network(arrdata['image'], width: 200, height: 140, fit: BoxFit.cover,)),
                                ), 
                
                                ListTile(
                                  title: Text(arrdata['name'],
                                  style: GoogleFonts.inter(
                                    color: br.white,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 14
                                  ),
                                  ),
                                  subtitle: Padding(
                                    padding: const EdgeInsets.only(top: 0.0),
                                    child: Text(arrdata['description'].toString(),
                                    style: GoogleFonts.inter(
                                      color: br.white,
                                      fontWeight: FontWeight.w500,
                                      fontSize: 13
                                    ),
                                    ),
                                  ),
                                )
                              ],
                            ),
                          ) : Container();
                          } 
                
                          return Container();
                
                          
                        })
                      );
                    })
                  ),
                ),
              ),

              SizedBox(
                height: 50,
              )


              
            ],
          ),
        )
      ),
    );
  }
}